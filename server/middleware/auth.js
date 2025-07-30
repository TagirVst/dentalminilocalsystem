const { User } = require('../models');

// Проверка авторизации
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.status(401).json({ error: 'Пользователь не найден или неактивен' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка роли
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    next();
  };
};

// Проверка что пользователь - врач
const requireDoctor = requireRole(['doctor']);

// Проверка что пользователь - администратор
const requireAdmin = requireRole(['admin']);

// Проверка что пользователь - управляющий
const requireManager = requireRole(['manager']);

// Проверка что пользователь - администратор или управляющий
const requireAdminOrManager = requireRole(['admin', 'manager']);

module.exports = {
  requireAuth,
  requireRole,
  requireDoctor,
  requireAdmin,
  requireManager,
  requireAdminOrManager
}; 

// Проверка авторизации
const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Необходима авторизация' });
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.status(401).json({ error: 'Пользователь не найден или неактивен' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка роли
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    next();
  };
};

// Проверка что пользователь - врач
const requireDoctor = requireRole(['doctor']);

// Проверка что пользователь - администратор
const requireAdmin = requireRole(['admin']);

// Проверка что пользователь - управляющий
const requireManager = requireRole(['manager']);

// Проверка что пользователь - администратор или управляющий
const requireAdminOrManager = requireRole(['admin', 'manager']);

module.exports = {
  requireAuth,
  requireRole,
  requireDoctor,
  requireAdmin,
  requireManager,
  requireAdminOrManager
}; 