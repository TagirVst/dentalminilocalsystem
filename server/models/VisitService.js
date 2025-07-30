module.exports = (sequelize, DataTypes) => {
  const VisitService = sequelize.define('VisitService', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    visitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'visits',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Количество услуг'
    },
    priceAtDate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Цена услуги на дату визита'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Подсумма (quantity * priceAtDate)'
    }
  }, {
    tableName: 'visit_services',
    timestamps: true
  });

  VisitService.associate = function(models) {
    VisitService.belongsTo(models.Visit, {
      foreignKey: 'visitId',
      as: 'visit'
    });
    
    VisitService.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });
  };

  return VisitService;
}; 
  const VisitService = sequelize.define('VisitService', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    visitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'visits',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Количество услуг'
    },
    priceAtDate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Цена услуги на дату визита'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Подсумма (quantity * priceAtDate)'
    }
  }, {
    tableName: 'visit_services',
    timestamps: true
  });

  VisitService.associate = function(models) {
    VisitService.belongsTo(models.Visit, {
      foreignKey: 'visitId',
      as: 'visit'
    });
    
    VisitService.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });
  };

  return VisitService;
}; 