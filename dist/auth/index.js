"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.router = (0, express_1.Router)();
// Helper to create JWT token
const generateToken = (userId, email) => {
    const secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign({ id: userId, email }, secret, { expiresIn: '12h' });
};
/** Register a new user */
exports.router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, passwordHash },
        });
        const token = generateToken(user.id, user.email);
        return res.json({ success: true, data: { token, userId: user.id } });
    }
    catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
/** Login existing user */
exports.router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const match = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = generateToken(user.id, user.email);
        return res.json({ success: true, data: { token, userId: user.id } });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
