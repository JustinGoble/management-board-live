const BPromise = require('bluebird');
const fs = BPromise.promisifyAll(require('fs'));
const { join } = require('path');
const express = require('express');
const logger = require('../logger')(__filename);

async function isDirectory(source) {
  const stat = await fs.lstatAsync(source);
  return stat.isDirectory();
}

async function routeChildPaths(app, route, dirPath) {
  const names = await fs.readdirAsync(dirPath);

  const children = await BPromise.map(names, async (name) => {
    const path = join(dirPath, name);
    const isDir = await isDirectory(path);
    return {
      isDir,
      path,
      name,
    };
  });

  for (let i = 0; i < children.length; i++) {
    const { isDir, path, name } = children[i];

    if (isDir) {
      await routeChildPaths(app, `${route}/${name}`,  path);
    } else {
      const router = express.Router();
      require(path)(router);
      app.use(route, router);
      logger.debug(`Attached ${path} to ${route}`);
    }
  }
}

async function attachRoutes(app) {
  await routeChildPaths(app, '/api', join(__dirname, 'api'));

  // Not found route
  app.all('/api/*', (req, res) => {
    res.status(404).send({ error: 'Endpoint not found' });
  });
}

module.exports = {
  attachRoutes,
};
