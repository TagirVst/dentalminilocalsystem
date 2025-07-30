module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define('Visit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ФИО пациента'
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Дата и время визита'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Комментарий к визиту'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Общая сумма визита'
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
      defaultValue: 'unpaid',
      comment: 'Статус оплаты'
    },
    cashPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты наличными'
    },
    cardPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты картой'
    },
    transferPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты переводом'
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата оплаты'
    },
    paidBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Кто принял оплату (администратор)'
    }
  }, {
    tableName: 'visits',
    timestamps: true
  });

  Visit.associate = function(models) {
    Visit.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor'
    });
    
    Visit.belongsTo(models.User, {
      foreignKey: 'paidBy',
      as: 'administrator'
    });
    
    Visit.belongsToMany(models.Service, {
      through: models.VisitService,
      foreignKey: 'visitId',
      as: 'services'
    });
    
    Visit.hasMany(models.VisitService, {
      foreignKey: 'visitId',
      as: 'visitServices'
    });
  };

  return Visit;
}; 
  const Visit = sequelize.define('Visit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ФИО пациента'
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    visitDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Дата и время визита'
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Комментарий к визиту'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Общая сумма визита'
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid'),
      defaultValue: 'unpaid',
      comment: 'Статус оплаты'
    },
    cashPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты наличными'
    },
    cardPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты картой'
    },
    transferPayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Сумма оплаты переводом'
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата оплаты'
    },
    paidBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Кто принял оплату (администратор)'
    }
  }, {
    tableName: 'visits',
    timestamps: true
  });

  Visit.associate = function(models) {
    Visit.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor'
    });
    
    Visit.belongsTo(models.User, {
      foreignKey: 'paidBy',
      as: 'administrator'
    });
    
    Visit.belongsToMany(models.Service, {
      through: models.VisitService,
      foreignKey: 'visitId',
      as: 'services'
    });
    
    Visit.hasMany(models.VisitService, {
      foreignKey: 'visitId',
      as: 'visitServices'
    });
  };

  return Visit;
}; 