"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-math-3";
class AuthService {
    /**
     * Hashea una contraseña usando bcrypt.
     */
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    /**
     * Compara una contraseña con su hash.
     */
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Genera un token JWT para un usuario.
     */
    static generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    }
    /**
     * Verifica un token JWT.
     */
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
