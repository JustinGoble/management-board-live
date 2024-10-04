const logger = require('../logger')(__filename);

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error(err.stack || err);
  logger.debug(JSON.stringify(err));

  return res.status(err.status || 500).send(err.message || err);
};
