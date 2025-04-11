'use strict';

const middleware = require('./middleware');
const issueSchemas = require('./schemas/issues');

module.exports = {
  middleware,
  schemas: {
    issues: issueSchemas
  }
};