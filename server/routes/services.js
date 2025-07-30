const express = require('express');
const { Service, ServiceGroup, ServiceSubgroup } = require('../models');
const { requireAuth, requireManager } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Получить все группы услуг
router.get('/groups', requireAuth, async (req, res) => {
  try {
    const groups = await ServiceGroup.findAll({
      include: [{
        model: ServiceSubgroup,
        as: 'subgroups'
      }],
      order: [['name', 'ASC'], ['subgroups', 'name', 'ASC']]
    });

    res.json(groups);
  } catch (error) {
    console.error('Ошибка получения групп услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все услуги с группировкой
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const services = await Service.findAll({
      where: whereClause,
      include: [
        {
          model: ServiceGroup,
          as: 'group'
        },
        {
          model: ServiceSubgroup,
          as: 'subgroup'
        }
      ],
      order: [['group', 'name', 'ASC'], ['subgroup', 'name', 'ASC'], ['name', 'ASC']]
    });

    res.json(services);
  } catch (error) {
    console.error('Ошибка получения услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать группу услуг (только для управляющего)
router.post('/groups', requireAuth, requireManager, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const group = await ServiceGroup.create({ name });
    res.status(201).json(group);
  } catch (error) {
    console.error('Ошибка создания группы услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать подгруппу услуг (только для управляющего)
router.post('/subgroups', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, groupId } = req.body;

    if (!name || !groupId) {
      return res.status(400).json({ error: 'Название подгруппы и ID группы обязательны' });
    }

    const subgroup = await ServiceSubgroup.create({ name, groupId });
    res.status(201).json(subgroup);
  } catch (error) {
    console.error('Ошибка создания подгруппы услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать услугу (только для управляющего)
router.post('/', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, groupId, subgroupId, currentPrice } = req.body;

    if (!name || !groupId || !currentPrice) {
      return res.status(400).json({ error: 'Название, группа и цена обязательны' });
    }

    const service = await Service.create({
      name,
      groupId,
      subgroupId: subgroupId || null,
      currentPrice
    });

    const serviceWithRelations = await Service.findByPk(service.id, {
      include: [
        { model: ServiceGroup, as: 'group' },
        { model: ServiceSubgroup, as: 'subgroup' }
      ]
    });

    res.status(201).json(serviceWithRelations);
  } catch (error) {
    console.error('Ошибка создания услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить цену услуги (только для управляющего)
router.put('/:id/price', requireAuth, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPrice } = req.body;

    if (!currentPrice) {
      return res.status(400).json({ error: 'Новая цена обязательна' });
    }

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    await service.update({
      currentPrice,
      priceUpdatedAt: new Date()
    });

    const updatedService = await Service.findByPk(id, {
      include: [
        { model: ServiceGroup, as: 'group' },
        { model: ServiceSubgroup, as: 'subgroup' }
      ]
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Ошибка обновления цены услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 
const { Service, ServiceGroup, ServiceSubgroup } = require('../models');
const { requireAuth, requireManager } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Получить все группы услуг
router.get('/groups', requireAuth, async (req, res) => {
  try {
    const groups = await ServiceGroup.findAll({
      include: [{
        model: ServiceSubgroup,
        as: 'subgroups'
      }],
      order: [['name', 'ASC'], ['subgroups', 'name', 'ASC']]
    });

    res.json(groups);
  } catch (error) {
    console.error('Ошибка получения групп услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все услуги с группировкой
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    const services = await Service.findAll({
      where: whereClause,
      include: [
        {
          model: ServiceGroup,
          as: 'group'
        },
        {
          model: ServiceSubgroup,
          as: 'subgroup'
        }
      ],
      order: [['group', 'name', 'ASC'], ['subgroup', 'name', 'ASC'], ['name', 'ASC']]
    });

    res.json(services);
  } catch (error) {
    console.error('Ошибка получения услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать группу услуг (только для управляющего)
router.post('/groups', requireAuth, requireManager, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const group = await ServiceGroup.create({ name });
    res.status(201).json(group);
  } catch (error) {
    console.error('Ошибка создания группы услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать подгруппу услуг (только для управляющего)
router.post('/subgroups', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, groupId } = req.body;

    if (!name || !groupId) {
      return res.status(400).json({ error: 'Название подгруппы и ID группы обязательны' });
    }

    const subgroup = await ServiceSubgroup.create({ name, groupId });
    res.status(201).json(subgroup);
  } catch (error) {
    console.error('Ошибка создания подгруппы услуг:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать услугу (только для управляющего)
router.post('/', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, groupId, subgroupId, currentPrice } = req.body;

    if (!name || !groupId || !currentPrice) {
      return res.status(400).json({ error: 'Название, группа и цена обязательны' });
    }

    const service = await Service.create({
      name,
      groupId,
      subgroupId: subgroupId || null,
      currentPrice
    });

    const serviceWithRelations = await Service.findByPk(service.id, {
      include: [
        { model: ServiceGroup, as: 'group' },
        { model: ServiceSubgroup, as: 'subgroup' }
      ]
    });

    res.status(201).json(serviceWithRelations);
  } catch (error) {
    console.error('Ошибка создания услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить цену услуги (только для управляющего)
router.put('/:id/price', requireAuth, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPrice } = req.body;

    if (!currentPrice) {
      return res.status(400).json({ error: 'Новая цена обязательна' });
    }

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Услуга не найдена' });
    }

    await service.update({
      currentPrice,
      priceUpdatedAt: new Date()
    });

    const updatedService = await Service.findByPk(id, {
      include: [
        { model: ServiceGroup, as: 'group' },
        { model: ServiceSubgroup, as: 'subgroup' }
      ]
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Ошибка обновления цены услуги:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 