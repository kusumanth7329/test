import User from '../models/users.js';
import sequelize from '../database.js';
import bcrypt from 'bcrypt';

export const handleNonGetReq = (req, res, next) => {
    if (req.path === '/healthz' && req.method !== 'GET') {
        res.set(commonHeaders()).status(405).send();
    } else {
        next();
    }
};

export const dbCheck = async (req, res, next) => {
    try {
        await sequelize.authenticate();
        next();
    } catch (error) {
        res.set(commonHeaders()).status(503).send();
    }
};

export const basicAuth = async (req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.set(commonHeaders()).status(401).json({ message: 'Missing Authorization Headers' });
    }

    const givenCreds = req.headers.authorization.split(' ')[1];
    const confirm = Buffer.from(givenCreds, 'base64').toString('ascii');
    const [username, password] = confirm.split(':');

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.set(commonHeaders()).status(401).json({ message: 'User not found' });
        }
        const verified = await bcrypt.compare(password, user.password);
        if (!verified) {
            return res.set(commonHeaders()).status(401).json({ message: "Invalid Credentials" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.set(commonHeaders()).status(500).json({ message: 'Internal Server Error' });
    }
};

export function commonHeaders() {
    return {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Expires': '-1',
        'X-Content-Type-Options': 'nosniff',
    };
}
