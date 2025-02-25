import express from "express";
import passport from 'passport';
import dotenv from 'dotenv';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();
dotenv.config();

// router.get('/google-authorize', GoogleAuthorize);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Generate access token
    const token = generateToken(req.user);

    // Log the generated token for debugging purposes
    console.log('Generated Token:', token);

    // Set HTTP-only cookie with access token
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirect to frontend URL
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

export default router;