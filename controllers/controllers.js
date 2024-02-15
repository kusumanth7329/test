import sequelize from '../database.js';
import { commonHeaders } from '../Middleware/middleware.js';
import User from '../models/users.js';
import bcrypt from 'bcrypt';

export const controllers = {
    connectionCheck: async (req, res) => {
        try {
            await sequelize.authenticate();
            res.set(commonHeaders()).status(200).send('');
        } catch (error) {
            res.set(commonHeaders()).status(503).send('');
        }
    },
};

export const userControl = {
    newUser: async (req, res) => {
        const { username, password, firstName, lastName } = req.body;
        if (!username || !password || !firstName || !lastName) {
            return res.set(commonHeaders()).status(400).send({ message: 'All fields are required' });
        }
        if(Object.keys(req.query).length !== 0){
            return res.status(400).header('Cache-Control', 'no-cache').json({ message: 'no query parameters allowed' });
          }
        try {
            const checkUser = await User.findOne({ where: { username } });
            if (checkUser) {
                return res.set(commonHeaders()).status(409).send({ message: "User already exists" });
            }

            const newUser = await User.create({ username, password, firstName, lastName });

            const { id, accountCreated, accountUpdated } = newUser.get({ plain: true });
            res.set(commonHeaders()).status(201).send({
                id,
                username,
                firstName,
                lastName,
                accountCreated,
                accountUpdated,
            });
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => err.message);
                return res.set(commonHeaders()).status(400).send({ message: "Validation error", errors: validationErrors });
            } else {
                res.set(commonHeaders()).status(500).send({ message: "Internal server error" });
            }
        }
    },
    getUser: async (req, res) => {
        const user = req.user;
        res.set(commonHeaders()).status(200).json({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            accountCreated: user.accountCreated,
            accountUpdated: user.accountUpdated,
        });
    },
    updateUser: async (req, res) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.set(commonHeaders()).status(400).send({ message: 'Bad request: No data provided' });
        }
        if(Object.keys(req.query).length !== 0){
            return res.status(400).header('Cache-Control', 'no-cache').json({ message: 'no query parameters allowed' });
          }
        const user = req.user;
        const updates = Object.keys(req.body);
        const isUpdatable = ['firstName', 'lastName', 'password'];
        const isValidOperation = updates.every(update => isUpdatable.includes(update));

        if (!isValidOperation) {
            return res.set(commonHeaders()).status(400).send({ message: 'Cannot Update the field' });
        }

        try {
            updates.forEach(update => {
                user[update] = req.body[update];
            });

            user.accountUpdated = new Date();
            await user.save();
            res.set(commonHeaders()).status(204).send();
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return res.set(commonHeaders()).status(400).send({ message: error.message });
            } else {
                console.error(error);
                res.set(commonHeaders()).status(500).send({ message: 'Internal server error' });
            }
        }
    },
};
