/* jshint indent: 2 */

export default function (sequelize, DataTypes) {
  const UserCourse = sequelize.define('student_course_association', {
    user_course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    invited_to: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'coures',
        key: 'course_id'
      }
    },
    invitation_accepted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
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
    }
  }, {
    tableName: 'user_course_association'
  });
  UserCourse.associate = (models) => {
    UserCourse.belongsTo(models.Users, {
      foreignKey: 'invited_to',
      as: 'invited'
    });
    UserCourse.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
  };
  return UserCourse;
}
