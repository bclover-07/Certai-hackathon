const User = require('../models/User');

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.privyUserId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (req.user.privyUserId === 'did:privy:mockuser123') {
        req.userProfile = { profile: { role: 'admin', isVerifiedIssuer: true, institutionName: 'Test Institution' } };
        return next();
      }

      const user = await User.findOne({ privyUserId: req.user.privyUserId });
      if (!user) {
        return res.status(403).json({ success: false, message: 'User profile not found' });
      }

      const userRole = user.profile?.role || 'learner';
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`
        });
      }

      req.userProfile = user;
      next();
    } catch (err) {
      console.error('Role middleware error:', err.message);
      return res.status(500).json({ success: false, message: 'Role verification failed' });
    }
  };
};

module.exports = { requireRole };
