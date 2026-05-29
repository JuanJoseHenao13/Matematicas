"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
exports.router = (0, express_1.Router)();
// Placeholder auth routes
exports.router.post('/login', (req, res) => {
    // In real app, validate credentials here
    const dummyToken = 'dummy-token';
    res.json({ success: true, data: { token: dummyToken } });
});
exports.router.post('/register', (req, res) => {
    // In real app, create user here
    res.json({ success: true, data: { message: 'registered' } });
});
