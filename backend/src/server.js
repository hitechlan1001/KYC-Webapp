import app from "./app.js";

const PORT = process.env.PORT || 8083;

async function startServer() {
  try {
    console.log('Starting server...');
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log('KYC notifications will be sent to email and Telegram');
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer();
