'use strict';

const respond = require('./responses');
const Issue = require('../models/issue');

const baseUrl = 'http://localhost:8080';

const Issues = {};

Issues.get = async (context) => {
  const issue = await Issue.findByPk(context.params.id);
  respond.success(context, { issue });
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

module.exports = Issues;
