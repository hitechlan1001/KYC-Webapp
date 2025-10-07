# Union.clubgg Backend API

A Node.js backend API for the Union.clubgg poker management system, providing authentication, data management, and role-based access control.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with JWT tokens
- **Role-Based Access Control** - Admin, Union Head, Regional Head, Club Owner, and more
- **MySQL Integration** - Connects to external MySQL database
- **RESTful API** - Clean API endpoints for all operations
- **Data Filtering** - Role-based data filtering and permissions
- **CORS Support** - Cross-origin resource sharing for frontend
- **Rate Limiting** - API rate limiting for security
- **Error Handling** - Comprehensive error handling and logging

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MySQL Database** (external database access)
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
PORT=8081
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
EXTERNAL_DB_HOST=your-database-host
EXTERNAL_DB_PORT=3306
EXTERNAL_DB_USER=your-database-username
EXTERNAL_DB_PASSWORD=your-database-password
EXTERNAL_DB_NAME=your-database-name

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8081` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `EXTERNAL_DB_HOST` | Database host | `172.233.47.88` |
| `EXTERNAL_DB_USER` | Database username | `gg_uni_ro` |
| `EXTERNAL_DB_PASSWORD` | Database password | `your-password` |

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

### Production Mode
```bash
NODE_ENV=production npm start
```

The server will start on `http://localhost:8081` (or your configured PORT).

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Data Management
- `GET /api/dashboard/overview` - Dashboard overview data
- `GET /api/dashboard/week-ranges` - Week range data
- `GET /api/dashboard/club-settlements` - Club settlement data
- `GET /api/players/GG_Member` - Player metrics data
- `GET /api/deals/*` - Deal management data
- `GET /api/users` - User management data

### Health Check
- `GET /api/health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents API abuse
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request data validation
- **SQL Injection Protection** - Parameterized queries
- **Error Handling** - Secure error responses

## 📊 Database Schema

The backend connects to an external MySQL database with the following main tables:
- `GG Member` - Member data and statistics
- `GG Club Settle` - Club settlement data
- `GG Member Statistics Deals` - Deal management data
- `uc_users` - User management data

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `.env`
   - Verify database server is running
   - Check network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:8081 | xargs kill -9`

3. **JWT Secret Error**
   - Ensure JWT_SECRET is set in `.env`
   - Use a strong, unique secret key

4. **CORS Issues**
   - Check CORS_ORIGIN in `.env`
   - Ensure frontend URL matches

### Logs

Check the console output for error messages and debugging information.

## 📝 Development

### Project Structure
```
backend/
├── src/
│   ├── config/          # Database and auth configuration
│   ├── middleware/      # Authentication and error handling
│   ├── routes/          # API route handlers
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and register in `src/server.js`
3. Add authentication middleware if needed
4. Test with appropriate HTTP client

## 🔄 Maintenance

### Regular Tasks
- Monitor server logs for errors
- Check database connection health
- Update dependencies regularly
- Backup environment configuration

### Updates
- Update Node.js and npm regularly
- Keep dependencies up to date
- Review and rotate JWT secrets
- Monitor security advisories

## 📞 Support

For technical support or questions:
- Check the logs for error messages
- Verify environment configuration
- Ensure all prerequisites are met
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.
