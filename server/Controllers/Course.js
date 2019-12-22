import hat from 'hat';
import db from '../../config/db';
import ResponseObject from '../Helpers/ResponseObject';
import Message from '../Helpers/Message';
import uploadFile from '../Helpers/uploadFile';
import Email from '../Email/user';
import PasswordManager from '../Helpers/PasswordManager';

const debug = require('debug')('EducationSystem: Controller/Course');

class Course {

  /**
   * Teacher create a Course
   * @params req.body
   * @return Promise
   */


  static createCourse(req, res, next) {
    uploadFile.uploadFile(req, async (cb) => {
      if (cb.success != true) {
        res.status(500).json(new ResponseObject(500, cb));
      }
      try {
        const post = cb.fields;
        const userId = req.user.query.user_id;
        debug(req.user);
        post.Course_created_by = userId;
        const CourseCreated = await db.Course.create(post);
        const CourseId = CourseCreated.Course_id;
        db.Course.max('Course_order', {
          where: {
            Course_created_by: userId
          },
          raw: true,
        }).then((Course) => {
          const CourseCount = (Course === null || Course == 0) ? 1 : Course + 1;
          db.Course.update({
            Course_order: CourseCount
          }, {
            where: {
              Course_id: CourseId
            }
          });
        });
        if (cb.fileDetail.length) {
          const imgpath = `Course/${CourseId}/`;
          uploadFile.generateThumbnail(imgpath, cb.fileDetail[0], (fileObj) => {
            db.Course.update({
              Course_image: fileObj.profile_image,
              Course_thumbnail_image: fileObj.profile_thumbnail_image
            }, {
              where: {
                Course_id: CourseId
              }
            });
          });
        }
        res.status(201).json(new ResponseObject(201, Message.CourseCreated, CourseId));
      } catch (err) {
        next(err);
      }
    });
  }

  /**
   * Teacher update a Course
   * @params req.body
   * @return Promise
   */


  static updateCourse(req, res, next) {
    uploadFile.uploadFile(req, async (cb) => {
      if (cb.success != true) {
        res.status(500).json(new ResponseObject(500, cb));
      }
      try {
        const post = cb.fields;
        const CourseCreated = await db.Course.update(post, {
          where: {
            Course_id: post.Course_id
          }
        });
        if (cb.fileDetail.length) {
          const CourseId = CourseCreated.Course_id;
          const imgpath = `Course/${CourseId}/`;
          uploadFile.generateThumbnail(imgpath, cb.fileDetail[0], (fileObj) => {
            db.Course.update({
              Course_image: fileObj.profile_image,
              Course_thumbnail_image: fileObj.profile_thumbnail_image
            }, {
              where: {
                Course_id: CourseId
              }
            });
          });
        }
        res.status(201).json(new ResponseObject(201, Message.CourseUpdated));
      } catch (err) {
        next(err);
      }
    });
  }

  /**
   * Invite User (Student)
   * @params req.body
   * @return Promise
   */


  static async inviteUser(req, res, next) {
    const post = req.body;
    const invitedBy = req.user.query.first_name;
    try {
      const userExisted = await db.Users.findOne({
        where: {
          email: post.email
        },
        raw: true,
        attributes: ['user_id']
      });
      if (userExisted) {
        const invitationExisted = await db.UserCourse.findOne({
          where: {
            invited_to: userExisted.user_id,
            Course_id: post.Course_id
          },
          raw: true,
          attributes: ['invitation_accepted']
        });
        if (invitationExisted) {
          res.status(200).json(new ResponseObject(200, Message.userAlreadyInvited));
        } else {
          await associateUserCourse(post.email, invitedBy, userExisted.user_id, post.Course_id, 1, null);
          res.status(201).json(new ResponseObject(201, Message.userInvited));
        }
      } else {
        const token = hat() + Date.now();
        const userCreated = await db.Users.create({
          email: post.email,
          verification_token: token
        });
        await associateUserCourse(post.email, invitedBy, userCreated.user_id, post.Course_id, 0, token);
        res.status(201).json(new ResponseObject(201, Message.userInvited));
      }
    } catch (err) {
      next(err);
    }
    const token = hat() + Date.now();
  }

  /**
   * Register Invited User
   * @params req.body
   * @return Promise
   */


  static async registerInvitedUser(req, res, next) {
    const token = req.params.token;
    const verifyToken = await db.Users.findOne({
      where: {
        verification_token: token
      },
      raw: true,
      attributes: ['user_id', 'email']
    });
    debug(verifyToken);
    if (verifyToken !== null) {
      uploadFile.uploadFile(req, async (cb) => {
        if (cb.success != true) {
          res.status(500).json(new ResponseObject(500, cb));
        }
        const post = cb.fields;
        const pmHelper = new PasswordManager();
        pmHelper.txtPassword = post.password;
        const passwordObj = pmHelper.createPasswordHash();
        post.password = passwordObj.password;
        post.salt = passwordObj.salt;
        post.verification_token = null;
        try {
          const userCreated = await db.Users.update(post, {
            where: {
              verification_token: token
            }
          });
          const invitationAccepted = await db.UserCourse.update({
            invitation_accepted: 1
          }, {
            where: {
              invited_to: verifyToken.user_id
            }
          });
          if (cb.fileDetail.length) {
            const userId = verifyToken.user_id;
            const imgpath = `profile/${userId}/`;
            uploadFile.generateThumbnail(imgpath, cb.fileDetail[0], (fileObj) => {
              db.Users.update(fileObj, {
                where: {
                  user_id: userId
                }
              });
            });
          }
          res.status(200).json(new ResponseObject(200, Message.invitedRegistration));
        } catch (err) {
          next(err);
        }
      });
    } else {
      res.status(200).json(new ResponseObject(400, Message.linkExpired));
    }
  }


}


/**
 * Create user Course association
 * @params email, invitedBy, userId, CourseId, invitationAccepted, token
 * @return Promise
 */

async function associateUserCourse(uEmail, invitedBy, userId, CourseId, invitationAccepted, token) {
  return new Promise((resolve, reject) => {
    const userCourseAssociated = db.UserCourse.create({
      invited_to: userId,
      Course_id: CourseId,
      invitation_accepted: invitationAccepted
    });
    if (!invitationAccepted) {
      const email = new Email();
      email.inviteUser(uEmail, invitedBy, token);
    }
    resolve(userCourseAssociated);
  });
}

export default Course;
