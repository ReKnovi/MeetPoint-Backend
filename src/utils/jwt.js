import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

export const generateToken = (user) => {
  console.log('user:', user);
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};