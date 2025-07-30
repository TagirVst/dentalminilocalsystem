const express = require('express');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Импорт роутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const visitRoutes = require('./routes/visits');

// Middleware
app.use(cors({
  origin: true, // Разрешить запросы с любых доменов
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Сессии
app.use(session({
  store: new FileStore({
    path: './sessions',
    encrypt: false
  }),
  secret: process.env.SESSION_SECRET || 'dental-backup-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/visits', visitRoutes);

// Статические файлы (для продакшна)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Тест соединения с БД
const db = require('./models');

app.listen(PORT, HOST, async () => {
  console.log(`Сервер запущен на http://${HOST}:${PORT}`);
  
  try {
    await db.sequelize.authenticate();
    console.log('✅ Соединение с базой данных установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
  }
}); 