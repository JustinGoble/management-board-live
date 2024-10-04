const morgan = require('morgan');
const logger = require('../logger')('request');
const config = require('../config');

let middleware = (req, res, next) => { next(); };

if (!config.DISABLE_REQUST_LOGGER) {
  logger.stream = {
    write: function write(message) {
      logger.info(message.trim());
    },
  };

  const morganConfig = { 'stream': logger.stream };

  if (config.NODE_ENV === 'development') {
    // :method :url :status :response-time ms - :res[content-length]
    middleware = morgan('dev', morganConfig);
  } else {
    // eslint-disable-next-line max-len
    // :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
    middleware = morgan('short', morganConfig);
  }
}

module.exports = middleware;
