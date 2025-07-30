'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем группы услуг
    await queryInterface.bulkInsert('service_groups', [
      {
        id: 1,
        name: 'Терапевтическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Хирургическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Ортопедическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Профилактика и гигиена',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Создаем подгруппы услуг
    await queryInterface.bulkInsert('service_subgroups', [
      {
        name: 'Лечение кариеса',
        groupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Эндодонтическое лечение',
        groupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Удаление зубов',
        groupId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Имплантация',
        groupId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Коронки',
        groupId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Протезы',
        groupId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Чистка зубов',
        groupId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_subgroups', null, {});
    await queryInterface.bulkDelete('service_groups', null, {});
  }
}; 

module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем группы услуг
    await queryInterface.bulkInsert('service_groups', [
      {
        id: 1,
        name: 'Терапевтическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Хирургическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Ортопедическое лечение',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Профилактика и гигиена',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Создаем подгруппы услуг
    await queryInterface.bulkInsert('service_subgroups', [
      {
        name: 'Лечение кариеса',
        groupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Эндодонтическое лечение',
        groupId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Удаление зубов',
        groupId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Имплантация',
        groupId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Коронки',
        groupId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Протезы',
        groupId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Чистка зубов',
        groupId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_subgroups', null, {});
    await queryInterface.bulkDelete('service_groups', null, {});
  }
}; 