# Union.clubgg KYC Backend API

A Node.js backend API for the Union.clubgg KYC verification system, providing secure identity verification with email and Telegram notifications.

## 🚀 Features

- **KYC Form Processing** - Secure submission of identity verification documents
- **Device Fingerprinting** - Advanced device identification and fraud detection
- **Email Notifications** - Comprehensive email alerts with all submission details
- **Telegram Notifications** - Real-time Telegram bot notifications
- **Security Analysis** - VPN/Proxy detection and location verification
- **File Upload Support** - Secure handling of driver's license and verification videos
- **IP2Location Integration** - Real location detection and fraud analysis
- **CORS Support** - Cross-origin resource sharing for frontend
- **Rate Limiting** - API rate limiting for security
- **Error Handling** - Comprehensive error handling and logging

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Environment Variables** (see Configuration section)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Server Configuration
PORT=8083
NODE_ENV=development

# Email Configuration
SERVICE_EMAIL=your-email@gmail.com
SERVICE_EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# IP2Location API (Optional)
IP2LOCATION_API_KEY=your-api-key

# File Upload Configuration
UPLOAD_DIR=/tmp
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVICE_EMAIL` | Gmail address for sending notifications | `kyc@yourdomain.com` |
| `SERVICE_EMAIL_PASSWORD` | Gmail app password | `your-app-password` |
| `ADMIN_EMAIL` | Admin email to receive notifications | `admin@yourdomain.com` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `TELEGRAM_CHAT_ID` | Telegram chat ID | `-1001234567890` |

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8083` (or your configured PORT).

## 📚 API Endpoints

### KYC Submission
- `POST /api/kyc/submit` - Submit KYC information and documents

### Health Check
- `GET /api/kyc/health` - Server health status
- `GET /health` - General health check

## 🔐 Security Features

- **Device Fingerprinting** - Unique device identification
- **VPN/Proxy Detection** - Advanced fraud detection
- **Location Verification** - IP-based location analysis
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Cross-origin request security
- **File Validation** - Secure file upload handling
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses

## 📊 Data Collection

The system collects comprehensive data for security analysis:

### Personal Information
- Full name, email, phone
- Address, city, state, country, postal code
- Player ID and platform information

### Device Information
- IP address and browser location
- Browser details (name, version, engine)
- Platform, screen resolution, device ID
- Timezone, language, user agent
- WebGL, Canvas, and Audio fingerprints
- Installed fonts and browser plugins

### Security Analysis
- Real location from IP2Location
- VPN/Proxy detection results
- Fraud score and risk assessment
- Location mismatch detection

## 🚨 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check Gmail app password in `.env`
   - Verify SERVICE_EMAIL and ADMIN_EMAIL
   - Check Gmail security settings

2. **Telegram Not Working**
   - Verify TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
   - Check bot permissions
   - Ensure bot is added to the chat

3. **File Upload Issues**
   - Check UPLOAD_DIR permissions
   - Verify file size limits (50MB max)
   - Check multer configuration

4. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:8083 | xargs kill -9`

### Logs

Check the console output for error messages and debugging information.

## 📝 Development

### Project Structure
```
backend/
├── src/
│   ├── middleware/      # Error handling middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Email and Telegram services
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app configuration
│   ├── server.js        # Main server file
│   └── serverless.js    # Vercel serverless handler
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

### Adding New Features

1. Create service files in `src/services/`
2. Add routes in `src/routes/`
3. Update middleware if needed
4. Test with appropriate HTTP client

## 🔄 Maintenance

### Regular Tasks
- Monitor server logs for errors
- Check email and Telegram delivery
- Update dependencies regularly
- Backup environment configuration

### Updates
- Update Node.js and npm regularly
- Keep dependencies up to date
- Monitor security advisories
- Test notification systems

## 📞 Support

For technical support or questions:
- Check the logs for error messages
- Verify environment configuration
- Ensure all prerequisites are met
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.