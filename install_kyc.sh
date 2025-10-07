#!/bin/bash

echo "🚀 Setting up KYC Verification System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create backend .env file
echo "🔧 Creating backend environment configuration..."
cat > .env << EOF
EXTERNAL_DB_HOST=localhost
EXTERNAL_DB_PORT=3306
EXTERNAL_DB_USER=root
EXTERNAL_DB_PASSWORD=password
EXTERNAL_DB_NAME=kyc_database
CORS_ORIGIN=http://localhost:8080
EOF
echo "✅ Backend .env file created"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create frontend .env file
echo "🔧 Creating frontend environment configuration..."
cat > .env << EOF
VITE_API_URL=http://localhost:8081
EOF
echo "✅ Frontend .env file created"

cd ..

echo ""
echo "🎉 KYC Verification System setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your database settings in backend/.env"
echo "2. Start the backend server: cd backend && npm run dev"
echo "3. Start the frontend server: cd frontend && npm run dev"
echo "4. Visit http://localhost:8080 to access the KYC system"
echo ""
echo "📚 For detailed documentation, see KYC_README.md"
