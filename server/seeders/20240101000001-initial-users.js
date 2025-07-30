'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Доктор Иванов',
        login: 'doctor1',
        password: hashedPassword,
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Доктор Петрова',
        login: 'doctor2',
        password: hashedPassword,
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Администратор Сидорова',
        login: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Управляющий Коваленко',
        login: 'manager',
        password: hashedPassword,
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
}; 

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Доктор Иванов',
        login: 'doctor1',
        password: hashedPassword,
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Доктор Петрова',
        login: 'doctor2',
        password: hashedPassword,
        role: 'doctor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Администратор Сидорова',
        login: 'admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Управляющий Коваленко',
        login: 'manager',
        password: hashedPassword,
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
}; 