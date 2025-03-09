const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        errors: [{ 
          message: 'You need to sign in to proceed.',
          code: 'NOT_SIGNEDIN'
        }]
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: false,
        errors: [{ 
          message: 'You need to sign in to proceed.',
          code: 'NOT_SIGNEDIN'
        }]
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      errors: [{ 
        message: 'You need to sign in to proceed.',
        code: 'NOT_SIGNEDIN'
      }]
    });
  }
};

module.exports = auth; 