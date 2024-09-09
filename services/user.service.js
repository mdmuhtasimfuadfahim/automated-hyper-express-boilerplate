import User from '../models/user.model.js';

const userService = {
    async createUser(data) {
        try {
            const newUser = await User.create(data);
            return newUser;
        } catch (error) {
            throw new Error('Error creating user');
        }
    },

    async getUserById(id) {
        try {
            const user = await User.findOne({ id });
            return user;
        } catch (error) {
            throw new Error('Error fetching user');
        }
    },

    async updateUser(id, updates) {
        try {
            const updatedUser = await User.updateOne({ id }, updates);
            return updatedUser;
        } catch (error) {
            throw new Error('Error updating user');
        }
    },

    async deleteUser(id) {
        try {
            const deletedUser = await User.destroyOne({ id });
            return deletedUser;
        } catch (error) {
            throw new Error('Error deleting user');
        }
    }
};

export default userService;