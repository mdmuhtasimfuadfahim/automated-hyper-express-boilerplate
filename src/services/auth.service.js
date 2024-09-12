import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const authService = {
    async register(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({ ...data, password: hashedPassword });
        return user;
    },

    async login(data) {
        const user = await User.findOne({ email: data.email });
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new Error('Invalid email or password');
        }
        const tokens = this.generateTokens(user);
        return tokens;
    },

    async logout(refreshToken) {
        // Implement token invalidation logic
    },

    async refreshTokens(refreshToken) {
        // Implement token refresh logic
    },

    async forgotPassword(email) {
        // Implement forgot password logic
    },

    async resetPassword(token, newPassword) {
        // Implement reset password logic
    },

    async sendVerificationEmail(user) {
        // Implement send verification email logic
    },

    async verifyEmail(token) {
        // Implement verify email logic
    },

    generateTokens(user) {
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    },
};

export default authService;