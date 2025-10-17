import app from "./app.js";

export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (e) {
    console.error("Serverless handler error:", e);
    res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}


