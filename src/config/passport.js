import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { generateRefreshToken } from '../utils/jwt.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: 'MeetPoint',
  audience: 'Meetpoint.com'
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.sub);
    
    if (!user) {
      return done(null, false);
    }
    
    // Add additional checks if needed (e.g., token version)
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.use(new GoogleStrategy({

    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
  },
     async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {

      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'user',
        password: hashedPassword,
        isVerified: true,
        isOauth: true
      });
      
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;