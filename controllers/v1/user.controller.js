import userService from '../../services/user.service.js';
import { z } from 'zod';

// Zod schema validation for POST request
const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
});

const userController = {
    async createUser(req, res) {
        try {
            const validatedData = createUserSchema.parse(req.body);
            const user = await userService.createUser(validatedData);
            res.status(201).json(user);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const updates = req.body;
            const user = await userService.updateUser(userId, updates);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const result = await userService.deleteUser(userId);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export default userController;