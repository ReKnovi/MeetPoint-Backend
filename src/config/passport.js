// import passport from 'passport';
// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import User from '../models/User.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.JWT_SECRET,
//   issuer: 'MeetPoint',
//   audience: 'Meetpoint.com'
// };

// passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
//   try {
//     const user = await User.findById(jwtPayload.sub);
    
//     if (!user) {
//       return done(null, false);
//     }
    
//     // Add additional checks if needed (e.g., token version)
//     return done(null, user);
//   } catch (error) {
//     return done(error, false);
//   }
// }));

// export default passport;