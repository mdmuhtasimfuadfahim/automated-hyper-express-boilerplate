import authService from '../../services/auth.service.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../../validations/auth.validation.js';
import { successResponse, errorResponse } from '../../utils/response.structure.js';

const authController = {
    async register(req, res) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const user = await authService.register(validatedData);
            res.status(201).json(successResponse('success', [user], 'limitUsageStats', 'User registered successfully', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json(errorResponse('error', 'limitUsageStats', error.errors, 'comment', 'traceCode', 'requestId'));
            }
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async login(req, res) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const tokens = await authService.login(validatedData);
            res.status(200).json(successResponse('success', [tokens], 'limitUsageStats', 'Login successful', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json(errorResponse('error', 'limitUsageStats', error.errors, 'comment', 'traceCode', 'requestId'));
            }
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async logout(req, res) {
        try {
            await authService.logout(req.body.refreshToken);
            res.status(200).json(successResponse('success', [], 'limitUsageStats', 'Logout successful', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async refreshTokens(req, res) {
        try {
            const tokens = await authService.refreshTokens(req.body.refreshToken);
            res.status(200).json(successResponse('success', [tokens], 'limitUsageStats', 'Tokens refreshed successfully', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async forgotPassword(req, res) {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            await authService.forgotPassword(validatedData.email);
            res.status(200).json(successResponse('success', [], 'limitUsageStats', 'Password reset email sent', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async resetPassword(req, res) {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            await authService.resetPassword(validatedData.token, validatedData.password);
            res.status(200).json(successResponse('success', [], 'limitUsageStats', 'Password reset successful', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async sendVerificationEmail(req, res) {
        try {
            await authService.sendVerificationEmail(req.user);
            res.status(200).json(successResponse('success', [], 'limitUsageStats', 'Verification email sent', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },

    async verifyEmail(req, res) {
        try {
            const validatedData = verifyEmailSchema.parse(req.body);
            await authService.verifyEmail(validatedData.token);
            res.status(200).json(successResponse('success', [], 'limitUsageStats', 'Email verified successfully', 'comment', 'traceCode', 'requestId'));
        } catch (error) {
            res.status(500).json(errorResponse('error', 'limitUsageStats', 'Internal Server Error', 'comment', 'traceCode', 'requestId'));
        }
    },
};

export default authController;