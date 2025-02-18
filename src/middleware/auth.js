import { verifyToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../config/constants.js';

export const requireAuth = (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not token provided',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

export const checkVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Please verify your email to access this feature'
    });
  }
  next();
};