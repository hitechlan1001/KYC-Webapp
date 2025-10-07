import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.EXTERNAL_DB_HOST,
  port: process.env.EXTERNAL_DB_PORT || 3306,
  user: process.env.EXTERNAL_DB_USER,
  password: process.env.EXTERNAL_DB_PASSWORD,
  database: process.env.EXTERNAL_DB_NAME,
  charset: 'utf8mb4',
  timezone: '+00:00',
  ssl: false,
};

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error('Missing required database environment variables. Please check your .env file.');
}

let pool = null;

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

export const connectDatabase = async () => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute('SELECT 1 as test');

    await initializeKYCTables();
    return { conn };
  } catch (error) {
    throw error;
  }
};

const initializeKYCTables = async () => {
  try {
    const conn = await getConnection();

    // KYC Tables
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS uc_kyc_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id VARCHAR(36) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        poker_platform VARCHAR(100),
        player_id VARCHAR(255),
        driver_license_file_path VARCHAR(500),
        verification_video_path VARCHAR(500),
        ip_address VARCHAR(45),
        device_fingerprint TEXT,
        geolocation_data JSON,
        device_specs JSON,
        status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
        verification_notes TEXT,
        verified_by VARCHAR(255),
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_submission_id (submission_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS uc_kyc_device_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kyc_submission_id INT NOT NULL,
        device_id VARCHAR(255),
        browser_info JSON,
        screen_resolution VARCHAR(50),
        timezone VARCHAR(100),
        language VARCHAR(10),
        platform VARCHAR(100),
        user_agent TEXT,
        canvas_fingerprint TEXT,
        webgl_fingerprint TEXT,
        audio_fingerprint TEXT,
        fonts JSON,
        plugins JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kyc_submission_id) REFERENCES uc_kyc_submissions(id) ON DELETE CASCADE,
        INDEX idx_device_id (device_id),
        INDEX idx_kyc_submission (kyc_submission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

  } catch (error) {
    throw error;
  }
};

export const closeConnections = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
