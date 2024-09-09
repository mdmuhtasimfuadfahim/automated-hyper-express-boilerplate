import userController from '../../../controllers/v1/user.controller.js';

export default async function (req, res) {
    userController.getUser(req, res);
}