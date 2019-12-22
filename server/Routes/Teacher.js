import express from 'express';
import Validate from 'express-validation';
import Teacher from '../Controllers/Teacher';
import Auth from '../Auth/auth';
import Validation from '../Validations/index';

const router = express.Router();

router.route('/')
  /* POST /v1.0/Teachers/ - User created a Teacher */
  .post(Auth, Teacher.createTeacher)
  /* PUT /v1.0/Teachers/ - User updated a Teacher */
  .put(Auth, Teacher.updateTeacher);

router.route('/inviteUser')
  /* POST /v1.0/Teachers/inviteUser - Invite user to Teacher */
  .post(Auth, Validate(Validation.inviteUser), Teacher.inviteUser);

router.route('/registerInvitedUser/:token')
  /* PUT /v1.0/Teachers/inviteUser - Register the invited user */
  .put(Teacher.registerInvitedUser);

// router.route('/login')
//   /* POST /v1.0/frontDesk/login - frontDesk login */
//   .post(Validate(Validation.login), User.login);

module.exports = router;
