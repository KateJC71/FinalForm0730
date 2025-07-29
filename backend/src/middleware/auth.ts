import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/init';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '需要身份驗證令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: '無效的令牌' });
    }

    // 從資料庫獲取用戶信息
    const query = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?';
    db.get(query, [decoded.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }
      
      req.user = user as User;
      next();
    });
  });
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}; 