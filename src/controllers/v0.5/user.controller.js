import { z } from 'zod';
import logger from '../../config/log4js.js';
import userService from '../../services/user.service.js';
import {
  createUserSchema,
  getUserSchema,
} from '../../validations/user.validation.js';
import {
  successResponse,
  errorResponse,
} from '../../utils/response.structure.js';

const userController = {
  async createUser(req, res) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await userService.createUser(validatedData);
      res
        .status(201)
        .json(
          successResponse(
            'success',
            [user],
            'User created successfully',
            'comment',
            'traceCode',
            'requestId',
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
              'traceCode',
              'requestId',
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
            'traceCode',
            'requestId',
          ),
        );
    }
  },

  async getUser(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json(
            errorResponse(
              'error',
              'User ID is required',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      const user = await userService.getUser(userId);
      if (!user) {
        return res
          .status(404)
          .json(
            errorResponse(
              'error',
              'User not found',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [user],
            'User retrieved successfully',
            'comment',
            'traceCode',
            'requestId',
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
            'traceCode',
            'requestId',
          ),
        );
    }
  },

  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json(
            errorResponse(
              'error',
              'User ID is required',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      let validatedId = getUserSchema.parse({ id: userId }).id;
      const updates = req.body;
      const user = await userService.updateUser(validatedId, updates);
      if (!user) {
        return res
          .status(404)
          .json(
            errorResponse(
              'error',
              'User not found',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [user],
            'User updated successfully',
            'comment',
            'traceCode',
            'requestId',
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
              'traceCode',
              'requestId',
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
            'traceCode',
            'requestId',
          ),
        );
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json(
            errorResponse(
              'error',
              'User ID is required',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      const user = await userService.deleteUser(userId);
      if (!user) {
        return res
          .status(404)
          .json(
            errorResponse(
              'error',
              'User not found',
              'comment',
              'traceCode',
              'requestId',
            ),
          );
      }
      res
        .status(200)
        .json(
          successResponse(
            'success',
            [user],
            'User deleted successfully',
            'comment',
            'traceCode',
            'requestId',
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
            'traceCode',
            'requestId',
          ),
        );
    }
  },
};

export default userController;
