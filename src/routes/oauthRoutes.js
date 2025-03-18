import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { generateRefreshToken, generateToken } from '../utils/jwt.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { token, email, name } = req.body;

  try {
    // ✅ Directly verify the token without exchanging it
    const ticket = await client.verifyIdToken({
      idToken: token, // Use the token directly
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // ✅ Ensure the email from the payload matches the frontend email
    if (payload.email !== email) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name,
        email,
        role: 'user',
        password: hashedPassword,
        isVerified: true,
        isOauth: true,
      });

      const refreshToken = generateRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save();
    }

    // ✅ Generate JWT token for the user
    const jwtToken = generateToken(user);

    res.json({  success: true,
                token: jwtToken, 
                 user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
          }, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
});

export default router;
