import { check } from 'express-validator';
import { USER_ROLES, PROFILE_TYPE } from '../config/constants.js';

export const registerValidation = [
  check('name', 'Name is required').not().isEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 8 characters long and contain at least one uppercase letter, one symbol, and one number')
  .isLength({ min: 8 })
  .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  check('role', 'Invalid role').optional().isIn(Object.values(USER_ROLES)),
];

export const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists(),
];

export const forgotPasswordValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
];

export const resetPasswordValidation = [
  check('token', 'Token is required').not().isEmpty(),
  check('newPassword', 'Password must be at least 8 characters').isLength({ min: 8 }),
];