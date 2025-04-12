'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');
const Revision = require('../models/revision');


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
    const userEmail = context.state.user.email;
    
    const issue = await Issue.create({
      title,
      description,
      created_by: userEmail
    });
    
    // Create initial revision for the new issue
    await Revision.create({
      issue_id: issue.id,
      issue_data: {
        title: issue.title,
        description: issue.description,
        created_by: issue.created_by,
        updated_by: issue.updated_by,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      },
      changes: {
        title: { from: null, to: title },
        description: { from: null, to: description },
        created_by: { from: null, to: userEmail }
      },
      created_by: userEmail
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
    const { title, description } = context.request.body;
    const userEmail = context.state.user.email;
    
    // Find the issue by ID
    const issue = await Issue.findByPk(id);
    
    // If issue not found, return 404
    if (!issue) {
      return respond.notFound(context);
    }
    
    // Store original values before update
    const originalValues = {
      title: issue.title,
      description: issue.description,
      updated_by: issue.updated_by
    };
    
    // Update the issue properties
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    issue.updated_by = userEmail;
    
    // Track changes
    const changes = {};
    if (title !== undefined && title !== originalValues.title) {
      changes.title = { from: originalValues.title, to: title };
    }
    if (description !== undefined && description !== originalValues.description) {
      changes.description = { from: originalValues.description, to: description };
    }
    changes.updated_by = { from: originalValues.updated_by, to: userEmail };
    
    // Only create a revision if there are actual changes
    if (Object.keys(changes).length > 0) {
      await issue.save();
      
      await Revision.create({
        issue_id: issue.id,
        issue_data: {
          title: issue.title,
          description: issue.description,
          created_by: issue.created_by,
          updated_by: issue.updated_by,
          created_at: issue.created_at,
          updated_at: issue.updated_at
        },
        changes: changes,
        created_by: userEmail
      });
    } else {
      // No changes were made, but still save to update timestamps
      await issue.save();
    }
    
    respond.success(context, { issue });
  } catch (error) {
    console.error('Error updating issue:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

/**
 * Get all revisions for an issue
 * @param {Object} context - Koa context
 */
Issues.getRevisions = async (context) => {
  try {
    const { id } = context.params;
    
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return respond.notFound(context);
    }
    
    const revisions = await Revision.findAll({
      where: { issue_id: id },
      order: [['created_at', 'ASC']]
    });
    
    respond.success(context, { revisions });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};


module.exports = Issues;
