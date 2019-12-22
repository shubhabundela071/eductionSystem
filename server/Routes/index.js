import express from 'express';
import userRoutes from './User';
import courseRoutes from './Course';
import teacherRoutes from './Teacher';
import ResponseObject from '../Helpers/ResponseObject';

const router = express.Router();

/** GET /welcome - Welcome to Education system API */
router.get('/welcome', (req, res) =>
  res.status(200).json(new ResponseObject(200, {
    message: 'Welcome to Trello Clone API'
  }))
);

// mount user routes at /users (student)
router.use('/users', userRoutes);

// mount course routes at /boards
router.use('/course', courseRoutes);

// mount board lists routes at /teacherRoutes
router.use('/teacher', teacherRoutes);


export default router;
