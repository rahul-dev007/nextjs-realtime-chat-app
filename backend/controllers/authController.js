// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role });

        // create token
        const token = generateToken({ id: user._id, role: user.role });

        // set httpOnly cookie
        res.cookie(process.env.COOKIE_NAME || 'token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken({ id: user._id, role: user.role });

        res.cookie(process.env.COOKIE_NAME || 'token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// logout
exports.logout = async (req, res) => {
    res.clearCookie(process.env.COOKIE_NAME || 'token');
    res.json({ message: 'Logged out' });
};

// get profile
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
};
