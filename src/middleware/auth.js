import { verifyToken, verifyRefreshToken, generateToken, generateRefreshToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../config/constants.js';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
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
      message: 'No token provided',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded.user;
    next();
  } catch (error) {
    // Token is expired, try to refresh it
    try {
      const decoded = jwt.decode(token);
      const user = await User.findById(decoded.user._id);
      if (!user || !user.refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      const decodedRefreshToken = verifyRefreshToken(user.refreshToken);
      if (!decodedRefreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const accessToken = generateToken(user);
      const RefreshToken = generateRefreshToken(user);

      user.refreshToken = RefreshToken;
      await user.save();

      res.setHeader('accesstoken', accessToken);
      res.setHeader('refreshtoken', RefreshToken);

      req.user = user;
      next();
    } catch (refreshError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
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

export const refreshTokenIfExpired = async (req, res, next) => {
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
      message: 'No token provided',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded.user;
    next();
  } catch (error) {
    // Token is expired, try to refresh it
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    try {
      const decodedRefreshToken = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefreshToken.user._id);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.setHeader('x-access-token', newToken);
      res.setHeader('x-refresh-token', newRefreshToken);

      req.user = user;
      next();
    } catch (refreshError) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  }
};
