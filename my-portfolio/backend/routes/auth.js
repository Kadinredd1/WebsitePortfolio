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
      // Generate JWT token for GitHub users
      const token = jwt.sign(
        { adminId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Redirect back to the frontend with admin hash
      res.redirect(`${process.env.FRONTEND_URL}/#admin?login=success&token=${token}`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/#admin?login=error&message=Authentication failed`);
    }
  }
);

// Check if user is authenticated
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
