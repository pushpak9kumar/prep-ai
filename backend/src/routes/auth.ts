import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = Router();

// 1. REGISTER API
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check karo ki user pehle se exist toh nahi karta
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Password ko hash karo (security ke liye)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Database mein user save karo
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.log("🚨 LOGIN ERROR DETAILS:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. LOGIN API
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // User dhundo
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Password check karo
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // JWT Token generate karo (User ko login rakhta hai)
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '7d' } // Token 7 din tak valid rahega
    );

    res.json({ message: 'Login successful', token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;