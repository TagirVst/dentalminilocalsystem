module.exports = (sequelize, DataTypes) => {
  const ServiceGroup = sequelize.define('ServiceGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Название группы услуг'
    }
  }, {
    tableName: 'service_groups',
    timestamps: true
  });

  ServiceGroup.associate = function(models) {
    ServiceGroup.hasMany(models.ServiceSubgroup, {
      foreignKey: 'groupId',
      as: 'subgroups'
    });
    
    ServiceGroup.hasMany(models.Service, {
      foreignKey: 'groupId',
      as: 'services'
    });
  };

  return ServiceGroup;
}; 
  const ServiceGroup = sequelize.define('ServiceGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Название группы услуг'
    }
  }, {
    tableName: 'service_groups',
    timestamps: true
  });

  ServiceGroup.associate = function(models) {
    ServiceGroup.hasMany(models.ServiceSubgroup, {
      foreignKey: 'groupId',
      as: 'subgroups'
    });
    
    ServiceGroup.hasMany(models.Service, {
      foreignKey: 'groupId',
      as: 'services'
    });
  };

  return ServiceGroup;
}; 