import authController from '../../../controllers/v1/auth.controller.js';

export default async function (req, res) {
    authController.logout(req, res);
}