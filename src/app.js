import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
// import authRoutes from './routes/authRoutes.js';
// import professionalRoutes from './routes/professionalRoutes.js';
// import appointmentRoutes from './routes/appointmentRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import errorHandler from './middleware/errorHandler.js';
import './config/passport.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/professionals', professionalRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes);

// // Error handling
// app.use(errorHandler);

// Test route
app.get('/', (req, res) => {
  res.send('Appointment Booking API');
});

export default app;