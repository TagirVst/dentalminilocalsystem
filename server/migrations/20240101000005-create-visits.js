'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patientName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      visitDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        defaultValue: 'unpaid'
      },
      cashPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      cardPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      transferPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paidBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('visits');
  }
}; 

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      patientName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      visitDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        defaultValue: 'unpaid'
      },
      cashPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      cardPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      transferPayment: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paidBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('visits');
  }
}; 