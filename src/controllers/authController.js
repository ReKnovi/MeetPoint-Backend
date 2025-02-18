import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../config/constants.js';
import { transporter } from '../utils/email.js';
import crypto from 'crypto';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    console.log()

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
    const verificationUrl = `${process.env.BASE_URL}/verify-email/${verificationToken}`;
    
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

    res.status(HTTP_STATUS.OK).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

