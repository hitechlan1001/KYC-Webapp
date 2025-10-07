import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getConnection } from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Database initialization endpoint for testing
router.get('/init-db', async (req, res) => {
  try {
    const conn = await getConnection();
    
    // Check if tables exist
    const [tableCheck] = await conn.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'uc_kyc_submissions'
    `);
    
    if (tableCheck[0].count === 0) {
      // Import and run database initialization
      const { initializeKYCTables } = await import('../config/database.js');
      await initializeKYCTables();
      
      res.json({
        success: true,
        message: 'Database tables created successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'Database tables already exist'
      });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize database',
      message: error.message
    });
  }
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

    const conn = await getConnection();
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

    // Handle file paths
    const driverLicensePath = req.files?.driverLicense?.[0]?.path || null;
    const verificationVideoPath = req.files?.verificationVideo?.[0]?.path || null;

    // Insert KYC submission
    const [result] = await conn.execute(`
      INSERT INTO uc_kyc_submissions (
        submission_id, full_name, email, phone, address, city, state, country, 
        postal_code, poker_platform, player_id, driver_license_file_path, 
        verification_video_path, ip_address, device_fingerprint, 
        geolocation_data, device_specs, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      submissionId, fullName, email, phone, address, city, state, country,
      postalCode, pokerPlatform, playerId, driverLicensePath,
      verificationVideoPath, clientIP, deviceFingerprint,
      JSON.stringify(geolocation), JSON.stringify(deviceSpecsData)
    ]);

    const kycSubmissionId = result.insertId;

    // Insert device data if available
    if (deviceSpecsData) {
      await conn.execute(`
        INSERT INTO uc_kyc_device_data (
          kyc_submission_id, device_id, browser_info, screen_resolution,
          timezone, language, platform, user_agent, canvas_fingerprint,
          webgl_fingerprint, audio_fingerprint, fonts, plugins
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        kycSubmissionId,
        deviceSpecsData.deviceId || null,
        JSON.stringify(deviceSpecsData.browserInfo || {}),
        deviceSpecsData.screenResolution || null,
        deviceSpecsData.timezone || null,
        deviceSpecsData.language || null,
        deviceSpecsData.platform || null,
        deviceSpecsData.userAgent || null,
        deviceSpecsData.canvasFingerprint || null,
        deviceSpecsData.webglFingerprint || null,
        deviceSpecsData.audioFingerprint || null,
        JSON.stringify(deviceSpecsData.fonts || []),
        JSON.stringify(deviceSpecsData.plugins || [])
      ]);
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

// Get KYC submission by ID (public endpoint for status checking)
router.get('/status/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT 
        submission_id, full_name, status, created_at, updated_at,
        verification_notes, verified_at
      FROM uc_kyc_submissions 
      WHERE submission_id = ?
    `, [submissionId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC status',
      message: error.message
    });
  }
});

// Admin endpoints (simplified - no auth for demo)
router.get('/submissions', requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('Fetching KYC submissions with params:', { status, page, limit, offset });
    
    const conn = await getConnection();
    
    // First check if table exists
    const [tableCheck] = await conn.execute(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'uc_kyc_submissions'
    `);
    
    if (tableCheck[0].count === 0) {
      console.log('KYC tables not found, returning empty result');
      return res.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }
    
    let whereClause = '';
    let queryParams = [];
    
    if (status) {
      whereClause = 'WHERE status = ?';
      queryParams.push(status);
    }
    
    const [rows] = await conn.execute(`
      SELECT 
        id, submission_id, full_name, email, phone, poker_platform, 
        player_id, status, created_at, updated_at, ip_address
      FROM uc_kyc_submissions 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    const [countResult] = await conn.execute(`
      SELECT COUNT(*) as total
      FROM uc_kyc_submissions 
      ${whereClause}
    `, queryParams);

    console.log('Successfully fetched submissions:', rows.length);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC submissions',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/submission/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT 
        k.*,
        d.device_id, d.browser_info, d.screen_resolution, d.timezone,
        d.language, d.platform, d.user_agent, d.canvas_fingerprint,
        d.webgl_fingerprint, d.audio_fingerprint, d.fonts, d.plugins
      FROM uc_kyc_submissions k
      LEFT JOIN uc_kyc_device_data d ON k.id = d.kyc_submission_id
      WHERE k.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Error fetching KYC submission details:', error);
    res.status(500).json({
      error: 'Failed to fetch KYC submission details',
      message: error.message
    });
  }
});

router.put('/submission/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;

    if (!['pending', 'approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const conn = await getConnection();

    const [result] = await conn.execute(`
      UPDATE uc_kyc_submissions 
      SET status = ?, verification_notes = ?, verified_by = ?, 
          verified_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, verificationNotes, 'admin', new Date(), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      message: 'KYC status updated successfully'
    });

  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({
      error: 'Failed to update KYC status',
      message: error.message
    });
  }
});

// Get file for download (admin only)
router.get('/file/:submissionId/:fileType', requireAdmin, async (req, res) => {
  try {
    const { submissionId, fileType } = req.params;
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT ${fileType === 'license' ? 'driver_license_file_path' : 'verification_video_path'} as file_path
      FROM uc_kyc_submissions 
      WHERE submission_id = ?
    `, [submissionId]);

    if (rows.length === 0 || !rows[0].file_path) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = rows[0].file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath);

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      error: 'Failed to download file',
      message: error.message
    });
  }
});

export default router;
