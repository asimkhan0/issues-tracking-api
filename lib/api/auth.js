'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');
const respond = require('./responses');

const Auth = {};

/**
 * Generate a JWT token for testing purposes
 * @param {Object} context - Koa context
 */
Auth.generateToken = async (context) => {
  try {
    const { email } = context.request.body;
    
    if (!email) {
      return respond.badRequest(context, ['Email is required']);
    }
    
    const token = jwt.sign(
      { 
        email,
        iat: Math.floor(Date.now() / 1000),
        clientId: context.get('X-Client-ID') || 'default-client'
      }, 
      config.jwtSecret, 
      { expiresIn: '24h' }
    );
    
    respond.success(context, { token });
  } catch (error) {
    console.error('Error generating token:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

module.exports = Auth;