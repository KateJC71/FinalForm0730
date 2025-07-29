import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { generateToken } from '../middleware/auth';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

const router = Router();

// 註冊
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('用戶名至少需要3個字符'),
  body('email').isEmail().withMessage('請輸入有效的電子郵件'),
  body('password').isLength({ min: 6 }).withMessage('密碼至少需要6個字符')
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // 檢查用戶是否已存在
    const checkUser = 'SELECT id FROM users WHERE email = ? OR username = ?';
    db.get(checkUser, [email, username], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ message: '資料庫錯誤' });
      }
      if (existingUser) {
        return res.status(400).json({ message: '用戶名或電子郵件已存在' });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const insertUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.run(insertUser, [username, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ message: '創建用戶失敗' });
        }

        const token = generateToken(this.lastID);
        res.status(201).json({
          message: '註冊成功',
          token,
          user: {
            id: this.lastID,
            username,
            email
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入
router.post('/login', [
  body('email').isEmail().withMessage('請輸入有效的電子郵件'),
  body('password').notEmpty().withMessage('密碼不能為空')
], (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], async (err, user: User) => {
    if (err) {
      return res.status(500).json({ message: '資料庫錯誤' });
    }
    if (!user) {
      return res.status(401).json({ message: '電子郵件或密碼錯誤' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '電子郵件或密碼錯誤' });
    }

    const token = generateToken(user.id);
    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

export default router; 