import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 8081;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
}

startServer();
