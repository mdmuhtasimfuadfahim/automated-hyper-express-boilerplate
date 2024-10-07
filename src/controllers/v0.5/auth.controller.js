import { z } from 'zod';
import logger from '../../config/log4js.js';
import authService from '../../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../validations/auth.validation.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.structure.js';

const authController = {
  async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);
      res
        .status(201)
        .json(
          successResponse(
            'success',
            [user],
            'User registered successfully',
            `User registered with ID: ${user._id} and log traceCode: ${req.traceCode}`,
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json(
            errorResponse(
              'error',
              'Input feilds are not valid!',
              error.errors,
              req.traceCode,
              req.requestId,
            ),
          );
      }
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            error,
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const tokens = await authService.login(validatedData);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [tokens],
            'Login successful',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json(
            errorResponse(
              'error',
              error.errors,
              'comment',
              req.traceCode,
              req.requestId,
            ),
          );
      }
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async logout(req, res) {
    try {
      await authService.logout(req.body.refreshToken);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [],
            'Logout successful',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async refreshTokens(req, res) {
    try {
      const tokens = await authService.refreshTokens(req.body.refreshToken);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [tokens],
            'Tokens refreshed successfully',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async forgotPassword(req, res) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(validatedData.email);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [],
            'Password reset email sent',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async resetPassword(req, res) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(
        validatedData.token,
        validatedData.password,
      );
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [],
            'Password reset successful',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async sendVerificationEmail(req, res) {
    try {
      await authService.sendVerificationEmail(req.user);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [],
            'Verification email sent',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },

  async verifyEmail(req, res) {
    try {
      const validatedData = verifyEmailSchema.parse(req.body);
      await authService.verifyEmail(validatedData.token);
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [],
            'Email verified successfully',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    } catch (error) {
      logger.error('err: ', error);
      res
        .status(500)
        .json(
          errorResponse(
            'error',
            'Internal Server Error',
            'comment',
            req.traceCode,
            req.requestId,
          ),
        );
    }
  },
};

export default authController;
