import { validateSession } from "../config/auth.js";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const parts = authHeader.split(" ");
    const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized", message: "Missing token" });
    }

    const { valid, user, message } = validateSession(token);
    if (!valid) {
      return res.status(401).json({ error: "Unauthorized", message });
    }

    req.user = user;
    req.sessionId = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden", message: "Admin only" });
    }
    next();
  });
}


