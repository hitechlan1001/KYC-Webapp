# KYC Verification System

A comprehensive Know Your Customer (KYC) verification system built with React, Node.js, and MySQL. This system allows users to submit their identity information for verification while collecting device fingerprinting data to prevent fraud.

## Features

### Public Features (No Authentication Required)
- **KYC Submission Form**: Users can submit personal information, upload identity documents, and provide poker platform details
- **Device Fingerprinting**: Automatically collects device information including:
  - Device ID and browser information
  - Screen resolution and timezone
  - Canvas, WebGL, and audio fingerprints
  - Installed fonts and plugins
  - IP address and geolocation data
- **Status Checking**: Users can check their submission status using their submission ID
- **File Uploads**: Support for driver's license photos and verification videos

### Admin Features (Authentication Required)
- **Submission Management**: View and manage all KYC submissions
- **Status Updates**: Approve, reject, or mark submissions as under review
- **Detailed Review**: View complete submission details including device data
- **File Downloads**: Download uploaded identity documents
- **Search and Filtering**: Search submissions by name, email, or submission ID
- **Pagination**: Handle large numbers of submissions efficiently

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Hook Form with Zod validation
- React Router for navigation

### Backend
- Node.js with Express
- MySQL database
- Multer for file uploads
- JWT for authentication
- CORS and security middleware

### Device Fingerprinting
- Canvas fingerprinting
- WebGL fingerprinting
- Audio context fingerprinting
- Font detection
- Plugin enumeration
- Geolocation API integration

## Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database configuration:
   ```env
   EXTERNAL_DB_HOST=your_database_host
   EXTERNAL_DB_PORT=3306
   EXTERNAL_DB_USER=your_database_user
   EXTERNAL_DB_PASSWORD=your_database_password
   EXTERNAL_DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:8080
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Public Endpoints
- `POST /api/kyc/submit` - Submit KYC information
- `GET /api/kyc/status/:submissionId` - Check submission status

### Admin Endpoints (Requires Authentication)
- `GET /api/kyc/submissions` - Get all submissions with pagination
- `GET /api/kyc/submission/:id` - Get detailed submission information
- `PUT /api/kyc/submission/:id/status` - Update submission status
- `GET /api/kyc/file/:submissionId/:fileType` - Download uploaded files

## Database Schema

### uc_kyc_submissions
Stores the main KYC submission data including personal information, file paths, and verification status.

### uc_kyc_device_data
Stores detailed device fingerprinting information linked to each submission.

## Security Features

- **Device Fingerprinting**: Collects unique device characteristics to prevent fraud
- **IP Address Tracking**: Records and stores client IP addresses
- **Geolocation Verification**: Collects and stores location data
- **File Upload Security**: Validates file types and sizes
- **Data Encryption**: All sensitive data is properly handled and stored
- **Rate Limiting**: Prevents abuse with request rate limiting
- **CORS Protection**: Properly configured CORS policies

## Usage

### For Users
1. Visit the landing page at `/`
2. Click "Start KYC Submission" to begin the process
3. Fill out the personal information form
4. Upload identity documents (optional)
5. Submit the form and receive a submission ID
6. Use the submission ID to check status at `/kyc/status`

### For Administrators
1. Log in to the admin dashboard
2. Navigate to "KYC Admin" in the sidebar
3. Review submitted KYC information
4. Download and verify uploaded documents
5. Update submission status with verification notes

## File Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── kyc.js          # KYC API routes
│   │   ├── config/
│   │   │   └── database.js     # Database configuration with KYC tables
│   │   └── server.js           # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── KYC.tsx         # KYC submission form
│   │   │   ├── KYCStatus.tsx   # Status checking page
│   │   │   ├── KYCAdmin.tsx    # Admin management page
│   │   │   └── KYCLanding.tsx  # Landing page
│   │   ├── hooks/
│   │   │   └── useDeviceFingerprint.ts # Device fingerprinting hook
│   │   └── App.tsx             # Main app with routing
│   └── package.json
└── KYC_README.md
```

## Configuration

### Environment Variables
- Database connection settings
- JWT secret for authentication
- CORS origin configuration
- File upload limits and paths

### File Upload Settings
- Maximum file size: 50MB
- Allowed file types: Images and videos
- Storage location: `uploads/kyc/` directory

## Monitoring and Analytics

The system collects comprehensive device and location data to help identify potential fraud:
- Device fingerprinting helps detect if the same device is used for multiple submissions
- IP address tracking helps identify suspicious patterns
- Geolocation data helps verify the user's claimed location
- Browser and system information helps detect automated submissions

## Future Enhancements

- Integration with external identity verification services
- Automated document verification using OCR
- Real-time fraud detection algorithms
- Email notifications for status updates
- Bulk submission processing
- Advanced reporting and analytics

## Support

For technical support or questions about the KYC system, please contact the development team or refer to the main application documentation.
