// utils/generateToken.js
const jwt = require('jsonwebtoken');


function generateToken(payload) {
return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
}


module.exports = generateToken;