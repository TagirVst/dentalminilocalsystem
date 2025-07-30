'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      // Терапевтическое лечение - Лечение кариеса
      {
        name: 'Лечение кариеса (1 поверхность)',
        groupId: 1,
        subgroupId: 1,
        currentPrice: 2500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение кариеса (2 поверхности)',
        groupId: 1,
        subgroupId: 1,
        currentPrice: 3500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (1 канал)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 4500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (2 канала)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 7000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (3 канала)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 9500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Хирургическое лечение
      {
        name: 'Удаление зуба простое',
        groupId: 2,
        subgroupId: 3,
        currentPrice: 2000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Удаление зуба сложное',
        groupId: 2,
        subgroupId: 3,
        currentPrice: 4000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Установка импланта',
        groupId: 2,
        subgroupId: 4,
        currentPrice: 35000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ортопедическое лечение
      {
        name: 'Коронка металлокерамическая',
        groupId: 3,
        subgroupId: 5,
        currentPrice: 12000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Коронка циркониевая',
        groupId: 3,
        subgroupId: 5,
        currentPrice: 18000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Съемный протез частичный',
        groupId: 3,
        subgroupId: 6,
        currentPrice: 25000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Профилактика и гигиена
      {
        name: 'Профессиональная гигиена полости рта',
        groupId: 4,
        subgroupId: 7,
        currentPrice: 3500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Фторирование зубов',
        groupId: 4,
        subgroupId: 7,
        currentPrice: 1500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Консультация врача',
        groupId: 4,
        subgroupId: null,
        currentPrice: 1000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
}; 

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      // Терапевтическое лечение - Лечение кариеса
      {
        name: 'Лечение кариеса (1 поверхность)',
        groupId: 1,
        subgroupId: 1,
        currentPrice: 2500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение кариеса (2 поверхности)',
        groupId: 1,
        subgroupId: 1,
        currentPrice: 3500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (1 канал)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 4500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (2 канала)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 7000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Лечение пульпита (3 канала)',
        groupId: 1,
        subgroupId: 2,
        currentPrice: 9500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Хирургическое лечение
      {
        name: 'Удаление зуба простое',
        groupId: 2,
        subgroupId: 3,
        currentPrice: 2000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Удаление зуба сложное',
        groupId: 2,
        subgroupId: 3,
        currentPrice: 4000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Установка импланта',
        groupId: 2,
        subgroupId: 4,
        currentPrice: 35000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ортопедическое лечение
      {
        name: 'Коронка металлокерамическая',
        groupId: 3,
        subgroupId: 5,
        currentPrice: 12000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Коронка циркониевая',
        groupId: 3,
        subgroupId: 5,
        currentPrice: 18000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Съемный протез частичный',
        groupId: 3,
        subgroupId: 6,
        currentPrice: 25000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Профилактика и гигиена
      {
        name: 'Профессиональная гигиена полости рта',
        groupId: 4,
        subgroupId: 7,
        currentPrice: 3500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Фторирование зубов',
        groupId: 4,
        subgroupId: 7,
        currentPrice: 1500.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Консультация врача',
        groupId: 4,
        subgroupId: null,
        currentPrice: 1000.00,
        priceUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
}; 