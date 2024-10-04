const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const logger = require('./logger')(__filename);
const config = require('./config');
const requestLoggerMiddleware = require('./middlewares/request-logger-middleware');
const errorMiddleware = require('./middlewares/error-middleware');
const routes = require('./routes');
const staticRouter = require('./static');
const swaggerYamlLoader = require('./swagger-yaml-loader');

const swaggerDocument = swaggerYamlLoader.load('./docs/swagger/index.yaml');
logger.info('Loaded Swagger documentation');
logger.silly(JSON.stringify(swaggerDocument));

class App {
  constructor() {
    this.expressApp = express();
    this.instance = null;
  }

  async startAsync(port) {
    this.expressApp.use(cors());

    this.expressApp.use(requestLoggerMiddleware);

    this.expressApp.use(
      '/api/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
    logger.info('Hosting Swagger documentation at /api/api-docs');

    this.expressApp.use(bodyParser.json({ limit: '5mb', extended: true }));
    this.expressApp.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

    // This disables caching for the routes, it slows down the app slightly
    // but helps to avoid very weird issues
    this.expressApp.set('etag', false);

    // Load all files in endpoints
    await routes.attachRoutes(this.expressApp);

    // Attach error handler middleware
    this.expressApp.use(errorMiddleware);

    this.expressApp.use('/', staticRouter);

    return new Promise(resolve => {
      this.instance = this.expressApp.listen(port || config.PORT, () => {
        logger.info('Server listening at port', config.PORT);
        resolve();
      });
    });
  }

  close() {
    this.instance.close();
  }
}

module.exports = App;
