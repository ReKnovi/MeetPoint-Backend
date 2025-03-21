import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import oAuthRoutes from './routes/oauthRoutes.js';
import session from "express-session";
import errorHandler from './middleware/errorHandler.js';
import profileRoutes from './routes/profileRoutes.js';
import agoraRoutes from './routes/agoraRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
import './config/passport.js';
import dotenv from "dotenv";

const app = express();
dotenv.config();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(session({
  secret: process.env.GOOGLE_CLIENT_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());


/*
  Routes
 */
app.use('/api/auth', authRoutes);
app.use('/oauth', oAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/webrtc', agoraRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/availibility', availabilityRoutes);
app.use('/api/notification', notificationRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// Test route
app.get('/', (req, res) => {
  res.send('Appointment Booking API');
});

export default app;