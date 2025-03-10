// Environment Variables
import dotenv from 'dotenv';

dotenv.config();
export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.MONGODB_URI;
export const DB_NAME = process.env.DB_NAME || 'appointment-system';
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const FIREBASE_SERVICE_ACCOUNT_KEY = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
export const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

// App Constants
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// Time Constants
export const TIME_SLOT_INTERVAL = 30; // minutes
export const WORKING_HOURS = {
  START: 9,  // 9 AM
  END: 17     // 5 PM
};

export const PROFILE_TYPE = {
  USER: 'user',
  PROFESSIONAL: 'professional',
};

export const SERVICE_CATEGORY = {
  MEDICAL: 'medical',
  LEGAL: 'legal',
  EDUCATIONAL: 'educational',
  FINANCIAL: 'financial',
  OTHER: 'other',
};

export const SPECIALIZATION = {
  DOCTOR: 'doctor',
  LAWYER: 'lawyer',
  TEACHER: 'teacher',
  ACCOUNTANT: 'accountant',
  OTHER: 'other',
};