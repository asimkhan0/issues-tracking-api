'use strict';

const Sequelize = require('sequelize');
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

/**
 * Compare two revisions of an issue and return the differences
 * @param {Object} context - Koa context
 */
Issues.compareRevisions = async (context) => {
  try {
    const { id } = context.params;
    const { revisionA, revisionB, forceDirection } = context.request.body;
    
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return respond.notFound(context);
    }
    
    const revisionAData = await Revision.findByPk(revisionA);
    const revisionBData = await Revision.findByPk(revisionB);
    
    if (!revisionAData || !revisionBData) {
      return respond.badRequest(context, ['One or both revisions not found']);
    }
    
    if (revisionAData.issue_id !== parseInt(id) || revisionBData.issue_id !== parseInt(id)) {
      return respond.badRequest(context, ['Revisions do not belong to the specified issue']);
    }
    
    const isAOlder = new Date(revisionAData.created_at) < new Date(revisionBData.created_at);
    
    let olderRevision, newerRevision;
    
    if (forceDirection === 'newer-to-older') {
      olderRevision = isAOlder ? revisionBData : revisionAData;
      newerRevision = isAOlder ? revisionAData : revisionBData;
    } else {
      olderRevision = isAOlder ? revisionAData : revisionBData;
      newerRevision = isAOlder ? revisionBData : revisionAData;
    }
    
    const revisionsBetween = await Revision.findAll({
      where: { 
        issue_id: id,
        created_at: {
          [Sequelize.Op.gt]: olderRevision.created_at,
          [Sequelize.Op.lt]: newerRevision.created_at
        }
      },
      order: [['created_at', 'ASC']]
    });
    
    const changes = {};
    const beforeState = olderRevision.issue_data;
    const afterState = newerRevision.issue_data;
    
    Object.keys({ ...beforeState, ...afterState }).forEach(key => {
      if (JSON.stringify(beforeState[key]) !== JSON.stringify(afterState[key])) {
        changes[key] = {
          from: beforeState[key],
          to: afterState[key]
        };
      }
    });
    
    const response = {
      comparison: {
        before: beforeState,
        after: afterState,
        changes: changes,
        revisions: revisionsBetween.map(rev => ({
          id: rev.id,
          created_at: rev.created_at,
          created_by: rev.created_by
        }))
      }
    };
    
    respond.success(context, response);
  } catch (error) {
    console.error('Error comparing revisions:', error);
    context.status = 500;
    context.body = { message: 'Internal server error' };
  }
};

module.exports = Issues;
