'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');

const baseUrl = 'http://localhost:8080';

const Issues = {};

Issues.get = async (context) => {
  const issue = await Issue.findByPk(context.params.id);
  if (!issue) {
    return respond.notFound(context);
  }
  respond.success(context, { issue });
};

/**
 * List all stored issues
 * @param {Object} context - Koa context
 */
Issues.list = async (context) => {
  try {
    const issues = await Issue.findAll();
    respond.success(context, { issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

/**
 * Create a new issue
 * @param {Object} context - Koa context
 */
Issues.create = async (context) => {
  try {
    const { title, description } = context.request.body;
    
    const issue = await Issue.create({
      title,
      description
    });
    
    respond.success(context, { issue });
  } catch (error) {
    console.error('Error creating issue:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

/**
 * Update an existing issue
 * @param {Object} context - Koa context
 */
Issues.update = async (context) => {
  try {
    const { id } = context.params;
    const { title, description, updated_by } = context.request.body;
    
    // Find the issue by ID
    const issue = await Issue.findByPk(id);
    
    // If issue not found, return 404
    if (!issue) {
      return respond.notFound(context);
    }
    
    // Update the issue properties
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (updated_by !== undefined) issue.updated_by = updated_by;
    
    // Save the updated issue
    await issue.save();
    
    respond.success(context, { issue });
  } catch (error) {
    console.error('Error updating issue:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

module.exports = Issues;
