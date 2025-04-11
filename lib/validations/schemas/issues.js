'use strict';

const Joi = require('joi');

/**
 * Validation schemas for issue-related operations
 */
const IssueSchemas = {};

/**
 * Schema for creating a new issue
 */
IssueSchemas.create = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required'
  }),
  created_by: Joi.string(),
  updated_by: Joi.string()
});

/**
 * Schema for updating an existing issue
 */
IssueSchemas.update = Joi.object({
  title: Joi.string().messages({
    'string.empty': 'Title cannot be empty'
  }),
  description: Joi.string().messages({
    'string.empty': 'Description cannot be empty'
  }),
  updated_by: Joi.string()
});

module.exports = IssueSchemas;