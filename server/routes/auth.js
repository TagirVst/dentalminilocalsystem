const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Вход
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const user = await User.findOne({ 
      where: { login, isActive: true } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    req.session.userId = user.id;

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выход
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе' });
    }
    res.json({ message: 'Выход выполнен успешно' });
  });
});

// Проверка текущего пользователя
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      login: req.user.login,
      role: req.user.role
    }
  });
});

module.exports = router; 
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Вход
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }

    const user = await User.findOne({ 
      where: { login, isActive: true } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    req.session.userId = user.id;

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Выход
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при выходе' });
    }
    res.json({ message: 'Выход выполнен успешно' });
  });
});

// Проверка текущего пользователя
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      login: req.user.login,
      role: req.user.role
    }
  });
});

module.exports = router; 