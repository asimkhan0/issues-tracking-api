'use strict';

const Joi = require('joi');

/**
 * Validation schemas for revision-related operations
 */
const RevisionSchemas = {};

/**
 * Schema for comparing revisions
 */
RevisionSchemas.compare = Joi.object({
  revisionA: Joi.number().integer().required().messages({
    'any.required': 'First revision ID is required',
    'number.base': 'First revision ID must be a number'
  }),
  revisionB: Joi.number().integer().required().messages({
    'any.required': 'Second revision ID is required',
    'number.base': 'Second revision ID must be a number'
  })
});

module.exports = RevisionSchemas;