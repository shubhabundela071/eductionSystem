import express from 'express';
import Validate from 'express-validation';
import Course from '../Controllers/Course';
import Auth from '../Auth/auth';
import Validation from '../Validations/index';

const router = express.Router();

router.route('/')
  /* POST /v1.0/course/ - Teacher created a Course */
  .post(Auth, Course.createCourse)

  /* PUT /v1.0/courses/ - Teacher(User) updated a Course */
  .put(Auth, Course.updateCourse);

router.route('/inviteUser')
  /* POST /v1.0/course/invitestudent- Invite user to Student */
  .post(Auth, Validate(Validation.inviteUser), Course.inviteUser);

router.route('/registerInvitedUser/:token')
  /* PUT /v1.0/Courses/inviteUser - Register the invited user */
  .put(Course.registerInvitedUser);


module.exports = router;
