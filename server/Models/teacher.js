export default (sequelize, DataTypes) => {
  const teacher = sequelize.define('teacher', {
    teacher_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    teacher_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    teacher_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    teacher_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'http://localhost/trelloClone/public/images/teacher.png'
    },
    teacher_thumbnail_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'http://localhost/trelloClone/public/images/teacherThumbnail.png'
    },
    teacher_created_by: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    is_active: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    teacher_order: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'teacher'
  });
  teacher.associate = (models) => {
    teacher.belongsTo(models.Users, {
      foreignKey: 'teacher_created_by',
      as: 'teacherAdmin'
    });
    teacher.belongsToMany(models.Users, {
      through: 'Userteacher',
      foreignKey: 'invited_to',
      as: 'invitedUsers'
    });
    teacher.hasMany(models.teacherList, {
      as: 'teacherList'
    });
  };
  return teacher;
};