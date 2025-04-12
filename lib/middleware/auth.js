'use strict';

const jwt = require('jsonwebtoken');
const respond = require('../api/responses');
const config = require('../../config');

const publicPaths = ['/', '/health'];

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} context - Koa context
 * @param {Function} next - Next middleware
 */
module.exports = async (context, next) => {
  
  if (publicPaths.includes(context.path)) {
    return next();
  }

  const clientId = context.get('X-Client-ID');
  if (!clientId) {
    context.status = 400;
    context.body = { message: 'X-Client-ID header is required' };
    return;
  }

  const authHeader = context.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.status = 401;
    context.body = { message: 'Authorization header with Bearer token is required' };
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (!decoded.email) {
      context.status = 401;
      context.body = { message: 'Invalid token format: missing email claim' };
      return;
    }
    
    context.state.user = {
      email: decoded.email,
      clientId: clientId
    };
    
    return next();
  } catch (error) {
    console.error('Token verification error:', error.name, error.message);
    context.status = 401;
    context.body = { 
      message: 'Invalid or expired token', 
      error: error.name,
      details: error.message 
    };
  }
};