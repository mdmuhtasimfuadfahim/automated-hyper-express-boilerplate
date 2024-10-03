import User from '../models/user.model.js';
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
    return user;
  },

  async logout() {
    // Implement token invalidation logic
  },

  async refreshTokens() {
    // Implement token refresh logic
  },

  async forgotPassword() {
    // Implement forgot password logic
  },

  async resetPassword() {
    // Implement reset password logic
  },

  async sendVerificationEmail() {
    // Implement send verification email logic
  },

  async verifyEmail() {
    // Implement verify email logic
  },
};

export default authService;
