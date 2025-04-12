'use strict';

const Router = require('koa-router');
const router = new Router();
const validations = require('./validations');
const middleware = require('./middleware');
const issuesController = require('./api/issues');
const authController = require('./api/auth');

router.get('/', require('./api/discovery'));
router.get('/health', require('./api/health'));
router.get('/issues', middleware.auth, issuesController.list);
router.get('/issues/:id', middleware.auth, issuesController.get);
router.post('/issues', 
  middleware.auth,
  validations.middleware(validations.schemas.issues.create),
  issuesController.create
);
router.put('/issues/:id',
  middleware.auth,
  validations.middleware(validations.schemas.issues.update),
  issuesController.update
);
router.get('/issues/:id/revisions', middleware.auth, issuesController.getRevisions);

// Token generation endpoint for testing purposes
router.post('/generate-token', 
  validations.middleware(validations.schemas.auth.generateToken),
  authController.generateToken
);

module.exports = router;
