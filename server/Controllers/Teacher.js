import hat from 'hat';
import db from '../../config/db';
import ResponseObject from '../Helpers/ResponseObject';
import Message from '../Helpers/Message';
import uploadFile from '../Helpers/uploadFile';
import Email from '../Email/user';
import PasswordManager from '../Helpers/PasswordManager';

const debug = require('debug')('trelloClone: Controller/Teacher');

class Teacher {

  /**
   * create a Teacher
   * @params req.body
   * @return Promise
   */


  static createTeacher(req, res, next) {
    uploadFile.uploadFile(req, async (cb) => {
      if (cb.success != true) {
        res.status(500).json(new ResponseObject(500, cb));
      }
      try {
        const post = cb.fields;
        const userId = req.user.query.user_id;
        debug(req.user);
        post.Teacher_created_by = userId;
        const TeacherCreated = await db.Teacher.create(post);
        const TeacherId = TeacherCreated.teacher_id;
        db.Teacher.max('Teacher_order', {
          where: {
            Teacher_created_by: userId
          },
          raw: true,
        }).then((Teacher) => {
          const TeacherCount = (Teacher === null || Teacher == 0) ? 1 : Teacher + 1;
          db.Teacher.update({
            Teacher_order: TeacherCount
          }, {
            where: {
              teacher_id: TeacherId
            }
          });
        });
        if (cb.fileDetail.length) {
          const imgpath = `Teacher/${TeacherId}/`;
          uploadFile.generateThumbnail(imgpath, cb.fileDetail[0], (fileObj) => {
            db.Teacher.update({
              Teacher_image: fileObj.profile_image,
              Teacher_thumbnail_image: fileObj.profile_thumbnail_image
            }, {
              where: {
                teacher_id: TeacherId
              }
            });
          });
        }
        res.status(201).json(new ResponseObject(201, Message.TeacherCreated, TeacherId));
      } catch (err) {
        next(err);
      }
    });
  }

  /**
   *  update a Teacher
   * @params req.body
   * @return Promise
   */


  static updateTeacher(req, res, next) {
    uploadFile.uploadFile(req, async (cb) => {
      if (cb.success != true) {
        res.status(500).json(new ResponseObject(500, cb));
      }
      try {
        const post = cb.fields;
        const TeacherCreated = await db.Teacher.update(post, {
          where: {
            teacher_id: post.teacher_id
          }
        });
        if (cb.fileDetail.length) {
          const TeacherId = TeacherCreated.teacher_id;
          const imgpath = `Teacher/${TeacherId}/`;
          uploadFile.generateThumbnail(imgpath, cb.fileDetail[0], (fileObj) => {
            db.Teacher.update({
              Teacher_image: fileObj.profile_image,
              Teacher_thumbnail_image: fileObj.profile_thumbnail_image
            }, {
              where: {
                teacher_id: TeacherId
              }
            });
          });
        }
        res.status(201).json(new ResponseObject(201, Message.TeacherUpdated));
      } catch (err) {
        next(err);
      }
    });
  }

  /**
   * Invite User
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
        const invitationExisted = await db.UserTeacher.findOne({
          where: {
            invited_to: userExisted.user_id,
            teacher_id: post.teacher_id
          },
          raw: true,
          attributes: ['invitation_accepted']
        });
        if (invitationExisted) {
          res.status(200).json(new ResponseObject(200, Message.userAlreadyInvited));
        } else {
          await associateUserTeacher(post.email, invitedBy, userExisted.user_id, post.teacher_id, 1, null);
          res.status(201).json(new ResponseObject(201, Message.userInvited));
        }
      } else {
        const token = hat() + Date.now();
        const userCreated = await db.Users.create({
          email: post.email,
          verification_token: token
        });
        await associateUserTeacher(post.email, invitedBy, userCreated.user_id, post.teacher_id, 0, token);
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
          const invitationAccepted = await db.UserTeacher.update({
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
 * Create user Teacher association
 * @params email, invitedBy, userId, TeacherId, invitationAccepted, token
 * @return Promise
 */

async function associateUserTeacher(uEmail, invitedBy, userId, TeacherId, invitationAccepted, token) {
  return new Promise((resolve, reject) => {
    const userTeacherAssociated = db.UserTeacher.create({
      invited_to: userId,
      teacher_id: TeacherId,
      invitation_accepted: invitationAccepted
    });
    if (!invitationAccepted) {
      const email = new Email();
      email.inviteUser(uEmail, invitedBy, token);
    }
    resolve(userTeacherAssociated);
  });
}

export default Teacher;