# Union.clubgg Frontend Dashboard

A modern React-based web application for managing poker clubs, players, and deals with role-based access control and real-time data visualization.

## 🚀 Features

- **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- **Role-Based Access** - Different views for Admin, Union Head, Regional Head, etc.
- **Real-Time Data** - Live updates from backend API
- **Interactive Dashboard** - Charts, metrics, and analytics
- **User Management** - Create, edit, and manage users
- **Deal Management** - Comprehensive deal tracking and management
- **Player Metrics** - Detailed player statistics and performance
- **Reports & Analytics** - Weekly reports and system diagnostics
- **Responsive Design** - Works on desktop, tablet, and mobile

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Backend API** (must be running on port 8081)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:8081/api

```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8081/api` |

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The application will be available at `http://localhost:8080` (or your configured port).

## 📱 User Interface

### Main Navigation
- **Dashboard** - Overview of key metrics and statistics
- **Player Metrics** - Player performance and statistics
- **Deal Management** - Track and manage deals across clubs
- **Reports** - Weekly reports and system diagnostics
- **Regions & Clubs** - Manage regions and club information
- **Users** - User management (Admin/Union Head only)

### Role-Based Access
- **Admin** - Full access to all features
- **Union Head** - Access to union-level data
- **Regional Head** - Access to regional data
- **Club Owner** - Access to club-specific data
- **Managers/Agents** - Access to assigned entities

## 🔐 Authentication

### Login Process
1. Navigate to the login page
2. Enter username and password
3. System validates credentials with backend
4. JWT token is stored for session management
5. Redirected to dashboard upon successful login

### Session Management
- **Automatic Login** - Stays logged in until token expires
- **Session Timeout** - 24-hour session duration
- **Secure Logout** - Clears session data and redirects to login

## 📊 Data Management

### Dashboard Features
- **Key Metrics** - Total clubs, regions, players, settlements
- **Role-Based Filtering** - Data filtered based on user permissions
- **Real-Time Updates** - Live data from backend API
- **Interactive Charts** - Visual representation of data

### Deal Management
- **Multiple Deal Types** - Club deals, region deals, member deals
- **Pagination** - Handle large datasets efficiently
- **Search & Filter** - Find specific deals quickly
- **Export Capabilities** - Download data for analysis

### Player Metrics
- **Performance Tracking** - Player statistics and metrics
- **Club Assignments** - Track player club memberships
- **Historical Data** - View player performance over time

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - UI elements hidden based on permissions
- **API Security** - All requests authenticated with JWT tokens
- **Input Validation** - Form validation and sanitization
- **XSS Protection** - Cross-site scripting prevention

## 🎨 UI Components

### Design System
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme support (if implemented)

### Key Components
- **Sidebar Navigation** - Main navigation menu
- **Data Tables** - Sortable, filterable data tables
- **Charts & Graphs** - Data visualization components
- **Forms** - User input and data entry forms
- **Modals** - Overlay dialogs for actions

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend server is running
   - Verify API URL in `.env` file
   - Check network connectivity

2. **Login Issues**
   - Verify username and password
   - Check backend authentication
   - Clear browser cache and cookies

3. **Data Not Loading**
   - Check browser console for errors
   - Verify API endpoints are working
   - Check user permissions

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Browser Compatibility
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📝 Development

### Project Structure
```
frontend/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

### Adding New Features
1. Create component in `src/components/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Sidebar.tsx`
4. Test with different user roles

### Styling Guidelines
- Use Tailwind CSS classes
- Follow component-based architecture
- Maintain responsive design
- Use consistent spacing and typography

## 🔄 Maintenance

### Regular Tasks
- Monitor application performance
- Check for console errors
- Update dependencies regularly
- Test across different browsers

### Updates
- Update React and dependencies
- Keep Tailwind CSS current
- Review and update UI components
- Monitor security advisories

## 📱 Mobile Support

The application is fully responsive and works on:
- **Desktop** - Full feature set
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

## 🌐 Browser Support

- **Chrome** (Recommended)
- **Firefox**
- **Safari**
- **Edge**

## 📞 Support

For technical support or questions:
- Check browser console for errors
- Verify backend API is running
- Check environment configuration
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.