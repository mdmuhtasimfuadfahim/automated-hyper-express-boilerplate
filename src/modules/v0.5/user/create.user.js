import userController from '../../../controllers/v0.5/user.controller.js';

export default async function (req, res) {
  userController.createUser(req, res);
}
