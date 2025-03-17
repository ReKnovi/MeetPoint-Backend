// File: src/config/storage-config.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import Media from '../models/Media.js'; // Import the Media model

dotenv.config();

// Configure storage based on environment
const storageType = process.env.STORAGE_PROVIDER || 'local';

let storageEngine;

if (storageType === 's3') {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  storageEngine = multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { 
        fieldName: file.fieldname,
        'Content-Disposition': 'attachment'
      });
    },
    key: async (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const userId = req.user ? req.user._id : 'anonymous';
      const filepath = `uploads/${userId}/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      
      // Save file metadata to the database
      const media = new Media({
        filename: file.originalname,
        filepath,
        mimetype: file.mimetype
      });
      await media.save();

      cb(null, filepath);
    }
  });
} else {
  storageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.user ? req.user._id : 'anonymous';
      const destPath = path.join(process.env.LOCAL_STORAGE_PATH || 'src/public/uploads/', userId);
      fs.mkdirSync(destPath, { recursive: true });
      cb(null, destPath);
    },
    filename: async (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
      const filepath = path.join(process.env.LOCAL_STORAGE_PATH || 'src/public/uploads/', req.user ? req.user._id : 'anonymous', filename);
      
      // Save file metadata to the database
      const media = new Media({
        filename: file.originalname,
        filepath,
        mimetype: file.mimetype,
        user: req.user._id
      });
      await media.save();

      cb(null, filename);
    }
  });
}

// File filter configuration
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file type');
    error.code = 'LIMIT_FILE_TYPE';
    return cb(error, false);
  }
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    const error = new Error("Invalid file extension");
    error.code = 'LIMIT_FILE_EXTENSION';
    return cb(error, false);
  }
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storageEngine,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
});

export default upload;