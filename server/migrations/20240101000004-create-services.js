'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
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
      subgroupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'service_subgroups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      currentPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      priceUpdatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('services');
  }
}; 

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
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
      subgroupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'service_subgroups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      currentPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      priceUpdatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('services');
  }
}; 