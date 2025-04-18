import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE, // or use SMTP config
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


