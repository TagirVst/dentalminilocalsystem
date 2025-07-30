const express = require('express');
const { Visit, VisitService, Service, ServiceGroup, ServiceSubgroup, User } = require('../models');
const { requireAuth, requireDoctor, requireAdmin, requireAdminOrManager } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Получить визиты (с фильтрацией по роли)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    const user = req.user;

    let whereClause = {};
    let dateStart, dateEnd;

    // Определяем период по дате
    if (date) {
      dateStart = new Date(date);
      dateEnd = new Date(date);
      dateEnd.setDate(dateEnd.getDate() + 1);
    } else {
      // По умолчанию сегодня
      dateStart = new Date();
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date();
      dateEnd.setHours(23, 59, 59, 999);
    }

    whereClause.visitDate = {
      [Op.gte]: dateStart,
      [Op.lt]: dateEnd
    };

    // Фильтрация по роли
    if (user.role === 'doctor') {
      // Врач видит только свои визиты за сегодня
      whereClause.doctorId = user.id;
      
      // Врач не может смотреть другие дни
      if (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);
        
        if (requestedDate.getTime() !== today.getTime()) {
          return res.status(403).json({ error: 'Врач может просматривать только визиты за сегодня' });
        }
      }
    } else if (user.role === 'admin') {
      // Администратор видит все визиты за сегодня и вчера
      if (date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const requestedDate = new Date(date);
        if (requestedDate.toDateString() !== today.toDateString() && 
            requestedDate.toDateString() !== yesterday.toDateString()) {
          return res.status(403).json({ error: 'Администратор может просматривать только визиты за сегодня и вчера' });
        }
      }
      
      // Фильтр по врачу для администратора
      if (doctorId) {
        whereClause.doctorId = doctorId;
      }
    }
    // Управляющий может видеть все визиты за любой день

    const visits = await Visit.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ],
      order: [['visitDate', 'DESC']]
    });

    res.json(visits);
  } catch (error) {
    console.error('Ошибка получения визитов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать визит (только врач)
router.post('/', requireAuth, requireDoctor, async (req, res) => {
  try {
    const { patientName, services, comment } = req.body;

    if (!patientName || !services || services.length === 0) {
      return res.status(400).json({ error: 'ФИО пациента и услуги обязательны' });
    }

    // Создаем визит
    const visit = await Visit.create({
      patientName,
      doctorId: req.user.id,
      visitDate: new Date(),
      comment: comment || null,
      totalAmount: 0
    });

    let totalAmount = 0;

    // Добавляем услуги к визиту
    for (const serviceItem of services) {
      const { serviceId, quantity = 1 } = serviceItem;

      const service = await Service.findByPk(serviceId);
      if (!service) {
        await visit.destroy();
        return res.status(400).json({ error: `Услуга с ID ${serviceId} не найдена` });
      }

      const subtotal = parseFloat(service.currentPrice) * quantity;
      totalAmount += subtotal;

      await VisitService.create({
        visitId: visit.id,
        serviceId: service.id,
        quantity,
        priceAtDate: service.currentPrice,
        subtotal
      });
    }

    // Обновляем общую сумму визита
    await visit.update({ totalAmount });

    // Получаем созданный визит с полной информацией
    const createdVisit = await Visit.findByPk(visit.id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    res.status(201).json(createdVisit);
  } catch (error) {
    console.error('Ошибка создания визита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить оплату визита (только администратор)
router.put('/:id/payment', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { cashPayment = 0, cardPayment = 0, transferPayment = 0 } = req.body;

    const visit = await Visit.findByPk(id);
    if (!visit) {
      return res.status(404).json({ error: 'Визит не найден' });
    }

    // Проверяем, что оплата еще не была сохранена
    if (visit.paymentDate) {
      return res.status(400).json({ error: 'Оплата уже была сохранена и не может быть изменена' });
    }

    const totalPayment = parseFloat(cashPayment) + parseFloat(cardPayment) + parseFloat(transferPayment);
    const totalAmount = parseFloat(visit.totalAmount);

    let paymentStatus;
    if (totalPayment === 0) {
      paymentStatus = 'unpaid';
    } else if (totalPayment >= totalAmount) {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'partial';
    }

    await visit.update({
      cashPayment,
      cardPayment,
      transferPayment,
      paymentStatus,
      paymentDate: new Date(),
      paidBy: req.user.id
    });

    const updatedVisit = await Visit.findByPk(id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    res.json(updatedVisit);
  } catch (error) {
    console.error('Ошибка обновления оплаты:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить визит по ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let whereClause = { id };

    // Врач может видеть только свои визиты
    if (user.role === 'doctor') {
      whereClause.doctorId = user.id;
    }

    const visit = await Visit.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    if (!visit) {
      return res.status(404).json({ error: 'Визит не найден' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Ошибка получения визита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 
const { Visit, VisitService, Service, ServiceGroup, ServiceSubgroup, User } = require('../models');
const { requireAuth, requireDoctor, requireAdmin, requireAdminOrManager } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Получить визиты (с фильтрацией по роли)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    const user = req.user;

    let whereClause = {};
    let dateStart, dateEnd;

    // Определяем период по дате
    if (date) {
      dateStart = new Date(date);
      dateEnd = new Date(date);
      dateEnd.setDate(dateEnd.getDate() + 1);
    } else {
      // По умолчанию сегодня
      dateStart = new Date();
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date();
      dateEnd.setHours(23, 59, 59, 999);
    }

    whereClause.visitDate = {
      [Op.gte]: dateStart,
      [Op.lt]: dateEnd
    };

    // Фильтрация по роли
    if (user.role === 'doctor') {
      // Врач видит только свои визиты за сегодня
      whereClause.doctorId = user.id;
      
      // Врач не может смотреть другие дни
      if (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requestedDate = new Date(date);
        requestedDate.setHours(0, 0, 0, 0);
        
        if (requestedDate.getTime() !== today.getTime()) {
          return res.status(403).json({ error: 'Врач может просматривать только визиты за сегодня' });
        }
      }
    } else if (user.role === 'admin') {
      // Администратор видит все визиты за сегодня и вчера
      if (date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const requestedDate = new Date(date);
        if (requestedDate.toDateString() !== today.toDateString() && 
            requestedDate.toDateString() !== yesterday.toDateString()) {
          return res.status(403).json({ error: 'Администратор может просматривать только визиты за сегодня и вчера' });
        }
      }
      
      // Фильтр по врачу для администратора
      if (doctorId) {
        whereClause.doctorId = doctorId;
      }
    }
    // Управляющий может видеть все визиты за любой день

    const visits = await Visit.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ],
      order: [['visitDate', 'DESC']]
    });

    res.json(visits);
  } catch (error) {
    console.error('Ошибка получения визитов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать визит (только врач)
router.post('/', requireAuth, requireDoctor, async (req, res) => {
  try {
    const { patientName, services, comment } = req.body;

    if (!patientName || !services || services.length === 0) {
      return res.status(400).json({ error: 'ФИО пациента и услуги обязательны' });
    }

    // Создаем визит
    const visit = await Visit.create({
      patientName,
      doctorId: req.user.id,
      visitDate: new Date(),
      comment: comment || null,
      totalAmount: 0
    });

    let totalAmount = 0;

    // Добавляем услуги к визиту
    for (const serviceItem of services) {
      const { serviceId, quantity = 1 } = serviceItem;

      const service = await Service.findByPk(serviceId);
      if (!service) {
        await visit.destroy();
        return res.status(400).json({ error: `Услуга с ID ${serviceId} не найдена` });
      }

      const subtotal = parseFloat(service.currentPrice) * quantity;
      totalAmount += subtotal;

      await VisitService.create({
        visitId: visit.id,
        serviceId: service.id,
        quantity,
        priceAtDate: service.currentPrice,
        subtotal
      });
    }

    // Обновляем общую сумму визита
    await visit.update({ totalAmount });

    // Получаем созданный визит с полной информацией
    const createdVisit = await Visit.findByPk(visit.id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    res.status(201).json(createdVisit);
  } catch (error) {
    console.error('Ошибка создания визита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить оплату визита (только администратор)
router.put('/:id/payment', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { cashPayment = 0, cardPayment = 0, transferPayment = 0 } = req.body;

    const visit = await Visit.findByPk(id);
    if (!visit) {
      return res.status(404).json({ error: 'Визит не найден' });
    }

    // Проверяем, что оплата еще не была сохранена
    if (visit.paymentDate) {
      return res.status(400).json({ error: 'Оплата уже была сохранена и не может быть изменена' });
    }

    const totalPayment = parseFloat(cashPayment) + parseFloat(cardPayment) + parseFloat(transferPayment);
    const totalAmount = parseFloat(visit.totalAmount);

    let paymentStatus;
    if (totalPayment === 0) {
      paymentStatus = 'unpaid';
    } else if (totalPayment >= totalAmount) {
      paymentStatus = 'paid';
    } else {
      paymentStatus = 'partial';
    }

    await visit.update({
      cashPayment,
      cardPayment,
      transferPayment,
      paymentStatus,
      paymentDate: new Date(),
      paidBy: req.user.id
    });

    const updatedVisit = await Visit.findByPk(id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    res.json(updatedVisit);
  } catch (error) {
    console.error('Ошибка обновления оплаты:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить визит по ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    let whereClause = { id };

    // Врач может видеть только свои визиты
    if (user.role === 'doctor') {
      whereClause.doctorId = user.id;
    }

    const visit = await Visit.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'administrator',
          attributes: ['id', 'name']
        },
        {
          model: VisitService,
          as: 'visitServices',
          include: [{
            model: Service,
            as: 'service',
            include: [
              { model: ServiceGroup, as: 'group' },
              { model: ServiceSubgroup, as: 'subgroup' }
            ]
          }]
        }
      ]
    });

    if (!visit) {
      return res.status(404).json({ error: 'Визит не найден' });
    }

    res.json(visit);
  } catch (error) {
    console.error('Ошибка получения визита:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 