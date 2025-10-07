# KYC Verification System

A simple, clean KYC (Know Your Customer) verification webapp built with React, Node.js, and MySQL. This system allows users to submit their identity information for verification while collecting comprehensive device fingerprinting data to prevent fraud.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd kyc-app
   ./install_kyc.sh
   ```

2. **Configure database:**
   Create a `.env` file in the `backend` directory:
   ```env
   EXTERNAL_DB_HOST=your_database_host
   EXTERNAL_DB_PORT=3306
   EXTERNAL_DB_USER=your_database_user
   EXTERNAL_DB_PASSWORD=your_database_password
   EXTERNAL_DB_NAME=your_database_name
   CORS_ORIGIN=http://localhost:8080
   ```

3. **Start the application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8081

## 📱 Features

### Public Pages (No Login Required)
- **Landing Page** (`/`) - Professional landing page with clear navigation
- **KYC Submission** (`/kyc`) - Complete form with personal info, file uploads, and device fingerprinting
- **Status Check** (`/kyc/status`) - Users can check their submission status using submission ID

### Admin Panel
- **KYC Management** (`/kyc-admin`) - Admin interface for reviewing and managing submissions
- **Status Updates** - Approve, reject, or mark submissions as under review
- **File Downloads** - Download uploaded driver licenses and verification videos
- **Search & Filter** - Find submissions by name, email, or submission ID

## 🔒 Security Features

### Device Fingerprinting
- **Device ID Generation** - Unique device identification
- **Browser Information** - Browser type, version, and engine details
- **Screen & Display** - Resolution, color depth, and display properties
- **Canvas Fingerprinting** - Unique canvas rendering signatures
- **WebGL Fingerprinting** - Graphics card and rendering capabilities
- **Audio Fingerprinting** - Audio context characteristics
- **Font Detection** - Installed system fonts
- **Plugin Detection** - Browser plugins and extensions
- **Location Data** - IP address and geolocation coordinates
- **Timezone & Language** - System timezone and language settings

### Fraud Prevention
- Device fingerprinting helps identify duplicate submissions
- IP address tracking for suspicious patterns
- Geolocation verification against claimed location
- File upload validation and security measures

## 🗄️ Database Schema

The system uses two main tables:

### `uc_kyc_submissions`
Stores main KYC submission data including personal information, file paths, and verification status.

### `uc_kyc_device_data`
Stores detailed device fingerprinting information linked to each submission.

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Hook Form** with Zod validation
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MySQL** database
- **Multer** for file uploads
- **CORS** and security middleware

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── kyc.js              # KYC API endpoints
│   │   ├── config/
│   │   │   └── database.js         # Database configuration
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Error handling
│   │   └── server.js               # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── KYC.tsx             # KYC submission form
│   │   │   ├── KYCStatus.tsx       # Status checking page
│   │   │   ├── KYCAdmin.tsx        # Admin management page
│   │   │   └── KYCLanding.tsx      # Landing page
│   │   ├── hooks/
│   │   │   └── useDeviceFingerprint.ts # Device fingerprinting
│   │   ├── components/ui/          # UI components
│   │   └── App.tsx                 # Main app with routing
│   └── package.json
├── install_kyc.sh                  # Installation script
└── README.md                       # This file
```

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/kyc/submit` - Submit KYC information
- `GET /api/kyc/status/:submissionId` - Check submission status

### Admin Endpoints
- `GET /api/kyc/submissions` - Get all submissions with pagination
- `GET /api/kyc/submission/:id` - Get detailed submission information
- `PUT /api/kyc/submission/:id/status` - Update submission status
- `GET /api/kyc/file/:submissionId/:fileType` - Download uploaded files

## 📋 Usage

### For Users
1. Visit the landing page at `/`
2. Click "Start KYC Submission" to begin
3. Fill out personal information and upload documents
4. Submit and receive a submission ID
5. Use the submission ID to check status at `/kyc/status`

### For Administrators
1. Navigate to `/kyc-admin`
2. Review submitted KYC information
3. Download and verify uploaded documents
4. Update submission status with verification notes

## 🔧 Configuration

### File Upload Settings
- Maximum file size: 50MB
- Allowed file types: Images and videos
- Storage location: `uploads/kyc/` directory

### Environment Variables
- Database connection settings
- CORS origin configuration
- File upload limits and paths

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Environment Setup
Ensure your production environment has:
- MySQL database with proper permissions
- File system write permissions for uploads
- Proper CORS configuration
- SSL certificates for HTTPS

## 📊 Monitoring

The system collects comprehensive data to help identify potential fraud:
- Device fingerprinting for duplicate detection
- IP address tracking for suspicious patterns
- Geolocation data for location verification
- Browser information for automated submission detection

## 🤝 Support

For technical support or questions about the KYC system, please refer to the documentation or contact the development team.

## 📄 License

This project is licensed under the MIT License.
