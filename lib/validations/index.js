'use strict';

const middleware = require('./middleware');
const issueSchemas = require('./schemas/issues');
const revisionSchemas = require('./schemas/revisions');
const authSchemas = require('./schemas/auth');

module.exports = {
  middleware,
  schemas: {
    issues: issueSchemas,
    revisions: revisionSchemas,
    auth: authSchemas
  }
};