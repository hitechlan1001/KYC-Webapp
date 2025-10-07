import app from "./app.js";
import { connectDatabase } from "./config/database.js";

let isDbReady = false;
async function ensureDb() {
  if (!isDbReady) {
    await connectDatabase();
    isDbReady = true;
  }
}

export default async function handler(req, res) {
  try {
    await ensureDb();
    return app(req, res);
  } catch (e) {
    console.error("Serverless handler error:", e);
    res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}


