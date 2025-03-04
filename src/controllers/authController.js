import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../config/constants.js';
import { transporter } from '../utils/email.js';
import crypto from 'crypto';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name, email, password, and confirm password are required',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'User already exists',
      });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Email Verification',
      html: `
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 1 hour</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Generate JWT
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.isOauth) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please login with Google',
        redirectUrl: `${process.env.BASE_URL}/auth/google`
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const token = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(HTTP_STATUS.OK).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false&message=Invalid%20or%20expired%20token`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate new JWT with updated user payload
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Check the User-Agent header to determine if the request is from a mobile device
    const userAgent = req.headers['user-agent'];
    const isMobile = /mobile/i.test(userAgent);

    // Generate the appropriate URL based on the User-Agent
    const redirectUrl = isMobile
      ? `myapp://verify-email?success=true&token=${token}`
      : `${process.env.FRONTEND_URL}/verify-email?success=true&token=${token}`;

      console.log('Redirect URL:', redirectUrl);

    // Redirect to the appropriate URL
    res.redirect(redirectUrl);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false&message=${encodeURIComponent(error.message)}`);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/setPassword/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Email Verification',
      html: `
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 1 hour</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Verification email resent',
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

