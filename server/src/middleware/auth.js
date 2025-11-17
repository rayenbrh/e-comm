import { verifyAccessToken, verifyRefreshToken, generateAccessToken, setTokenCookies } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // If no access token, try to refresh
    if (!accessToken && refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        // Generate new access token
        accessToken = generateAccessToken(decoded.userId);
        setTokenCookies(res, accessToken, refreshToken);
      }
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify access token
    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid',
      });
    }

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

/**
 * Admin only access
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
};
