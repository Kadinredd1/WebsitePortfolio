import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import session from 'express-session';
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(' Starting server...');
console.log('Current directory:', __dirname);
console.log(' Environment:', process.env.NODE_ENV || 'development');
console.log(' Port:', PORT);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || `${process.env.API_BASE_URL || 'http://localhost:5000'}/auth/github/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if admin exists with this GitHub ID
      const Admin = mongoose.model('Admin');
      let admin = await Admin.findOne({ githubId: profile.id });
      
      if (!admin) {
        // Create new admin if they don't exist
        admin = new Admin({
          githubId: profile.id,
          githubUsername: profile.username,
          username: profile.username,
          email: profile.emails[0]?.value,
          role: 'admin',
          isActive: true
        });
        await admin.save();
      }
      
      return done(null, admin);
    } catch (error) {
      return done(error, null);
    }
  }));
  console.log(' GitHub OAuth strategy configured');
} else {
  console.log(' GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const Admin = mongoose.model('Admin');
    const user = await Admin.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Routes
console.log('🔗 Setting up routes...');
app.use('/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Auth routes: /auth/github, /auth/github/callback, /auth/status, /auth/logout`);
  console.log(`🔗 API routes: /api/projects, /api/admin, /api/health`);
});