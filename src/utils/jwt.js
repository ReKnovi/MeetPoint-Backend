import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_TOKEN_SECRET } from '../config/constants.js';

export const generateToken = (user) => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ user }, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};