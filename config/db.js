import Sequelize from 'sequelize';
import env from '../env';
//user like Student
import User from '../server/Models/users';
import Course from '../server/Models/course';
import UserCourse from '../server/Models/user_course_association';
import Teacher from '../server/Models/teacher';

const Op = Sequelize.Op;
const sequelize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  dialect: 'mysql',
  dialectOptions: {
    multipleStatements: true
  },
  define: {
    underscored: true
  },
  operatorAliases: Op,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

// Connect all the models/tables in the database to a db object,
// so everything is accessible via one object

const models = {
  Users: User(sequelize, Sequelize),
  Course: Course(sequelize, Sequelize),
  UserCourse: UserCourse(sequelize, Sequelize),
  Teacher: Teacher(sequelize, Sequelize)
};

Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

const db = {
  ...models,
  sequelize,
  Sequelize,
  Op
};

module.exports = db;
