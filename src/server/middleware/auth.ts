import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Missing Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};
