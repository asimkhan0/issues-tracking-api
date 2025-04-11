'use strict';

const Router = require('koa-router');
const router = new Router();
const validations = require('./validations');
const issuesController = require('./api/issues');

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));
router.get('/issues', issuesController.list);
router.get('/issues/:id', issuesController.get);
router.post('/issues', 
  validations.middleware(validations.schemas.issues.create),
  issuesController.create
);

module.exports = router;
