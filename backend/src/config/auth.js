// Simple authentication configuration without database
import bcrypt from 'bcryptjs';

// Simple user configuration - can be moved to environment variables later
const USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@union.clubgg',
    password: 'admin123', // In production, this should be hashed
    role: 'admin',
    union_id: null,
    region_id: null,
    club_id: null,
    manager_id: null,
    super_agent_id: null,
    agent_id: null,
    member_id: null,
    permissions: []
  },
  {
    id: 2,
    username: 'demo_user',
    email: 'demo@union.clubgg',
    password: 'demo123',
    role: 'union_head',
    union_id: 1,
    region_id: null,
    club_id: null,
    manager_id: null,
    super_agent_id: null,
    agent_id: null,
    member_id: null,
    permissions: []
  }
];

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

export const authenticateUser = async (username, password) => {
  const user = USERS.find(u => u.username === username && u.active !== false);
  
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }

  // Simple password comparison (in production, use bcrypt)
  if (user.password !== password) {
    return { success: false, message: 'Invalid credentials' };
  }

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    success: true,
    user: userWithoutPassword,
    message: 'Login successful'
  };
};

export const createSession = (user) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  sessions.set(sessionId, {
    userId: user.id,
    user: user,
    expiresAt: expiresAt,
    createdAt: new Date()
  });

  return {
    sessionId,
    expiresAt,
    user
  };
};

export const validateSession = (sessionId) => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return { valid: false, message: 'Session not found' };
  }

  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return { valid: false, message: 'Session expired' };
  }

  return {
    valid: true,
    user: session.user,
    session: session
  };
};

export const destroySession = (sessionId) => {
  sessions.delete(sessionId);
  return { success: true, message: 'Session destroyed' };
};

export const getUserById = (userId) => {
  return USERS.find(u => u.id === userId);
};

export const getUserByUsername = (username) => {
  return USERS.find(u => u.username === username);
};

// Helper function to generate session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour
