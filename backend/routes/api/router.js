const { knex } = require('../../database').connect();
const redis = require('../../redis');
const { wrapController } = require('../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/health',
    (req, res) => { res.status(200).send(); },
  );

  router.get(
    '/health/db',
    wrapController(async () => {
      await knex('users').select('id').limit(1);
      await redis.ping();
    }),
  );

  return router;
};
