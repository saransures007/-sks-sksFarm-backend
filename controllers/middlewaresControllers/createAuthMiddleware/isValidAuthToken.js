const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const isValidAuthToken = async (req, res, next, { userModel, jwtSecret = 'JWT_SECRET' }) => {
  try {
    const UserPassword = mongoose.model(userModel + 'Password');
    const User = mongoose.model(userModel);
    
    // Check for token in cookies first
    let token = req.cookies.token;

    // If cookie token is not present, check for Bearer token in Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extract the token from the Bearer string
      }
    }
    
    // If no token found in both places, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      });
    }

    // Verify the token
    const verified = jwt.verify(token, process.env[jwtSecret]);

    if (!verified) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      });
    }

    // Fetch user and userPassword from the database
    const userPasswordPromise = UserPassword.findOne({ user: verified.id, removed: false });
    const userPromise = User.findOne({ _id: verified.id, removed: false });

    const [user, userPassword] = await Promise.all([userPromise, userPasswordPromise]);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        result: null,
        message: "User doesn't exist, authorization denied.",
        jwtExpired: true,
      });
    }

    // Check if the token is part of the user's logged sessions
    const { loggedSessions } = userPassword;
    if (!loggedSessions.includes(token)) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'User is already logged out, try to login, authorization denied.',
        jwtExpired: true,
      });
    } else {
      const reqUserName = userModel.toLowerCase();
      req[reqUserName] = user;
      next();
    }
  } catch (error) {
    return res.status(503).json({
      success: false,
      result: null,
      message: error.message,
      error: error,
      controller: 'isValidAuthToken',
    });
  }
};

module.exports = isValidAuthToken;
