const pool = require('../config/db');
const redisClient = require('../config/redis');

exports.createUser = async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const [result] = await pool.query('INSERT INTO users (name, email, age) VALUES (?, ?, ?)', [name, email, age]);

        res.status(201).json({
            returnCode: '00',
            returnDesc: 'User created successfully',
            data: { id: result.insertId, name, email, age },
        });
    } catch (err) {
        res.status(500).json({ returnCode: '99', returnDesc: 'Failed to create user' });
    }
};

exports.getAllUsers = async (req, res) => {
    const cacheKey = 'users';

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json({ returnCode: '00', returnDesc: 'Success (cached)', data: JSON.parse(cachedData) });
        }

        const [rows] = await pool.query('SELECT id, name, email, age FROM users');

        await redisClient.setEx(cacheKey, 600, JSON.stringify(rows));

        res.json({ returnCode: '00', returnDesc: 'Success', data: rows });
    } catch (err) {
        res.status(500).json({ returnCode: '99', returnDesc: 'Failed to fetch users' });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    const cacheKey = `user:${userId}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json({ returnCode: '00', returnDesc: 'Success (cached)', data: JSON.parse(cachedData) });
        }

        const [rows] = await pool.query('SELECT id, name, email, age FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ returnCode: '01', returnDesc: 'User not found' });
        }

        await redisClient.setEx(cacheKey, 600, JSON.stringify(rows[0]));

        res.json({ returnCode: '00', returnDesc: 'Success', data: rows[0] });
    } catch (err) {
        res.status(500).json({ returnCode: '99', returnDesc: 'Failed to fetch user' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id, name, email, age } = req.body;
        await pool.query('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?', [name, email, age, id]);

        await redisClient.del('users');
        await redisClient.del(`user:${id}`);

        res.json({ returnCode: '00', returnDesc: 'User updated successfully', data: { id, name, email, age } });
    } catch (err) {
        res.status(500).json({ returnCode: '99', returnDesc: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        await redisClient.del('users');
        await redisClient.del(`user:${userId}`);

        res.json({ returnCode: '00', returnDesc: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ returnCode: '99', returnDesc: 'Failed to delete user' });
    }
};
