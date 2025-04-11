'use strict';

const respond = require('../api/responses');

/**
 * Creates a validation middleware using the provided schema
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} Koa middleware function
 */
module.exports = (schema) => {
  return async (context, next) => {
    try {
      // Validate request body against schema
      const { error, value } = schema.validate(context.request.body);
      
      if (error) {
        const errors = error.details.map(detail => detail.message);
        return respond.badRequest(context, errors);
      }
      
      // If validation passes, update the request body with validated values
      context.request.body = value;
      return next();
    } catch (err) {
      console.error('Validation error:', err);
      context.status = 500;
      context.body = { message: 'Internal server error during validation' };
    }
  };
};