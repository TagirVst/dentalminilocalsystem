const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth, requireManager } = require('../middleware/auth');

const router = express.Router();

// Получить всех пользователей (только для управляющего)
router.get('/', requireAuth, requireManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'login', 'role', 'isActive'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать пользователя (только для управляющего)
router.post('/', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, login, password, role } = req.body;

    if (!name || !login || !password || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (!['doctor', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    // Проверка уникальности логина
    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      login,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Пользователь создан успешно',
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth, requireManager } = require('../middleware/auth');

const router = express.Router();

// Получить всех пользователей (только для управляющего)
router.get('/', requireAuth, requireManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'login', 'role', 'isActive'],
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать пользователя (только для управляющего)
router.post('/', requireAuth, requireManager, async (req, res) => {
  try {
    const { name, login, password, role } = req.body;

    if (!name || !login || !password || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (!['doctor', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    // Проверка уникальности логина
    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      login,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: 'Пользователь создан успешно',
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 