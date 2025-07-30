module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название услуги'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_groups',
        key: 'id'
      }
    },
    subgroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'service_subgroups',
        key: 'id'
      }
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Актуальная цена услуги'
    },
    priceUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата последнего изменения цены'
    }
  }, {
    tableName: 'services',
    timestamps: true
  });

  Service.associate = function(models) {
    Service.belongsTo(models.ServiceGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    Service.belongsTo(models.ServiceSubgroup, {
      foreignKey: 'subgroupId',
      as: 'subgroup'
    });
    
    Service.belongsToMany(models.Visit, {
      through: models.VisitService,
      foreignKey: 'serviceId',
      as: 'visits'
    });
  };

  return Service;
}; 
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название услуги'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_groups',
        key: 'id'
      }
    },
    subgroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'service_subgroups',
        key: 'id'
      }
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Актуальная цена услуги'
    },
    priceUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата последнего изменения цены'
    }
  }, {
    tableName: 'services',
    timestamps: true
  });

  Service.associate = function(models) {
    Service.belongsTo(models.ServiceGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    Service.belongsTo(models.ServiceSubgroup, {
      foreignKey: 'subgroupId',
      as: 'subgroup'
    });
    
    Service.belongsToMany(models.Visit, {
      through: models.VisitService,
      foreignKey: 'serviceId',
      as: 'visits'
    });
  };

  return Service;
}; 