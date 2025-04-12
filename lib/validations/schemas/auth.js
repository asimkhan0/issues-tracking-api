'use strict';

const Joi = require('joi');

/**
 * Validation schemas for authentication-related operations
 */
const AuthSchemas = {};

/**
 * Schema for generating a token
 */
AuthSchemas.generateToken = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  })
});

module.exports = AuthSchemas;