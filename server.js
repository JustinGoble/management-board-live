const App = require('./backend/app');
const logger = require('./backend/logger')(__filename);

process.on('unhandledRejection', error => {
  logger.error('unhandledRejection', error);
});

const app = new App();
app.startAsync();

