import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// GitHub OAuth login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      // Generate JWT token for GitHub users
      const token = jwt.sign(
        { adminId: req.user._id },
        jwtSecret,
        { expiresIn: '24h' }
      );
      
      // Redirect to frontend with success and token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/admin?login=success&token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/admin?login=error&message=Authentication failed`);
    }
  }
);

// Check if user is authenticated (supports both session and JWT)
router.get('/status', async (req, res) => {
  try {
    // Check session-based auth (GitHub OAuth)
    if (req.isAuthenticated()) {
      return res.json({
        authenticated: true,
        user: {
          id: req.user._id,
          username: req.user.username,
          githubUsername: req.user.githubUsername,
          role: req.user.role
        }
      });
    }
    
    // Check JWT token (traditional login)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret);
        const admin = await Admin.findById(decoded.adminId);
        
        if (admin && admin.isActive) {
          return res.json({
            authenticated: true,
            user: {
              id: admin._id,
              username: admin.username,
              role: admin.role
            }
          });
        }
      } catch (error) {
        console.log('JWT verification failed:', error.message);
      }
    }
    
    res.json({ authenticated: false });
  } catch (error) {
    console.error('Auth status check error:', error);
    res.status(500).json({ authenticated: false, error: 'Server error' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

export default router;
