import { Router } from 'express';

export const router = Router();

// Placeholder auth routes
router.post('/login', (req, res) => {
  // In real app, validate credentials here
  const dummyToken = 'dummy-token';
  res.json({ success: true, data: { token: dummyToken } });
});

router.post('/register', (req, res) => {
  // In real app, create user here
  res.json({ success: true, data: { message: 'registered' } });
});
