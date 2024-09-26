import authController from '../../../controllers/v0.5/auth.controller.js';

export default async function (req, res) {
  authController.refreshTokens(req, res);
}
