module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Имя пользователя'
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Логин для входа'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Хеш пароля'
    },
    role: {
      type: DataTypes.ENUM('doctor', 'admin', 'manager'),
      allowNull: false,
      comment: 'Роль: doctor - врач, admin - администратор, manager - управляющий'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Активен ли пользователь'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = function(models) {
    // Связь с визитами (врач создает визиты)
    User.hasMany(models.Visit, {
      foreignKey: 'doctorId',
      as: 'visits'
    });
  };

  return User;
}; 
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Имя пользователя'
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Логин для входа'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Хеш пароля'
    },
    role: {
      type: DataTypes.ENUM('doctor', 'admin', 'manager'),
      allowNull: false,
      comment: 'Роль: doctor - врач, admin - администратор, manager - управляющий'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Активен ли пользователь'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = function(models) {
    // Связь с визитами (врач создает визиты)
    User.hasMany(models.Visit, {
      foreignKey: 'doctorId',
      as: 'visits'
    });
  };

  return User;
}; 