module.exports = (sequelize, DataTypes) => {
  const ServiceSubgroup = sequelize.define('ServiceSubgroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название подгруппы услуг'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_groups',
        key: 'id'
      }
    }
  }, {
    tableName: 'service_subgroups',
    timestamps: true
  });

  ServiceSubgroup.associate = function(models) {
    ServiceSubgroup.belongsTo(models.ServiceGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    ServiceSubgroup.hasMany(models.Service, {
      foreignKey: 'subgroupId',
      as: 'services'
    });
  };

  return ServiceSubgroup;
}; 
  const ServiceSubgroup = sequelize.define('ServiceSubgroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Название подгруппы услуг'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_groups',
        key: 'id'
      }
    }
  }, {
    tableName: 'service_subgroups',
    timestamps: true
  });

  ServiceSubgroup.associate = function(models) {
    ServiceSubgroup.belongsTo(models.ServiceGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    ServiceSubgroup.hasMany(models.Service, {
      foreignKey: 'subgroupId',
      as: 'services'
    });
  };

  return ServiceSubgroup;
}; 