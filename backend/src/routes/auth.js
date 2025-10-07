import express from "express";
import { authenticateUser, createSession, destroySession, validateSession } from "../config/auth.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await authenticateUser(username, password);
    if (!result.success) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const session = createSession(result.user);
    return res.json({ success: true, token: session.sessionId, user: session.user, expiresAt: session.expiresAt });
  } catch (error) {
    return res.status(500).json({ error: "Login failed", message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const parts = authHeader.split(" ");
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
    if (token) {
      destroySession(token);
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Logout failed" });
  }
});

router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"] || "";
  const parts = authHeader.split(" ");
  const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
  if (!token) {
    return res.status(401).json({ valid: false, error: "Missing token" });
  }
  const result = validateSession(token);
  if (!result.valid) {
    return res.status(401).json({ valid: false, error: result.message });
  }
  return res.json({ valid: true, user: result.user });
});

export default router;


