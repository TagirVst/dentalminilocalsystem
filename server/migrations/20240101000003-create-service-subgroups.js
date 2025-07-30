'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_subgroups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'service_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_subgroups');
  }
}; 

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_subgroups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'service_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('service_subgroups');
  }
}; 