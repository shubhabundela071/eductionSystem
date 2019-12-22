/* jshint indent: 2 */

export default (sequelize, DataTypes) => {
  const course = sequelize.define('course', {
    course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    course_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    course_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    course_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'http://localhost/EducationSystem/public/images/course.png'
    },
    course_thumbnail_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'http://localhost/EducationSystem/public/images/courseThumbnail.png'
    },
    course_created_by: {
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
    course_order: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'course'
  });
  Course.associate = (models) => {
    Course.belongsTo(models.Users, {
      foreignKey: 'course_created_by',
      as: 'courseAdmin'
    });
    Course.belongsToMany(models.Users, {
      through: 'UserCourse',
      foreignKey: 'invited_to',
      as: 'invitedUsers'
    });
    Course.hasMany(models.Teacher, {
      as: 'Teacher'
    });
  };
  return Course;
};
