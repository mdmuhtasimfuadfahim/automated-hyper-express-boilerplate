
const userService = {
    async createUser(data) {
        try {
            const newUser = await global.User.create(data);
            return newUser;
        } catch (error) {
            throw new Error('Error creating user');
        }
    },

    async getUserById(id) {
        try {
            const user = await global.User.findOne({ id });
            return user;
        } catch (error) {
            throw new Error('Error fetching user');
        }
    },

    async getAllUsers() {
        try {
            const users = await global.User.find();
            return users;
        } catch (error) {
            throw new Error('Error fetching users');
        }
    },

    async updateUser(id, updates) {
        try {
            const updatedUser = await global.User.updateOne({ id }, updates);
            return updatedUser;
        } catch (error) {
            throw new Error('Error updating user');
        }
    },

    async deleteUser(id) {
        try {
            const deletedUser = await global.User.destroyOne({ id });
            return deletedUser;
        } catch (error) {
            throw new Error('Error deleting user');
        }
    },
};

export default userService;