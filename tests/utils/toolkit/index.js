const _ = require('lodash');
const request = require('supertest');
const logger = require('../../../backend/logger')(__filename);
const operationTools = require('./operation-tools');
const userTools = require('./user-tools');
const divisionTools = require('./division-tools');
const branchTools = require('./branch-tools');
const gameTools = require('./game-tools');
const eventTypeTools = require('./event-type-tools');
const eventTools = require('./event-tools');
const requestTools = require('./request-tools');

async function processRequest(req, reqName, code = 200) {
  try {
    const res = await req.expect(code);
    logger.debug(`${reqName} - ${JSON.stringify(res.body)}`);
    return res.body;
  } catch (e) {
    throw new Error(`${reqName} - ${e.message}`);
  }
}

function getHealth() {
  return request(this.app)
    .get('/api/health');
}

function createToolkit(app) {
  const toolkit = {
    app: app.expressApp,
    processRequest,

    getHealth,

    ...operationTools,
    ...userTools,
    ...divisionTools,
    ...branchTools,
    ...gameTools,
    ...eventTypeTools,
    ...eventTools,
    ...requestTools,
  };

  /**
   * For each function getSomething(param1, param2, ...)
   * create a new function getSomethingProc(param1, param2, ..., code)
   * which wraps processRequest(req, reqName, code) around it
   */
  _.forEach(toolkit, (func, key) => {
    if (_.isFunction(func)) {
      // Bind the methods so that this.app becomes available
      toolkit[key] = func.bind(toolkit);

      toolkit[`${key}Proc`] = async function procReq(...args) {
        const params = args.splice(0, func.length);
        const req = toolkit[key](...params);
        return this.processRequest(req, key, ...args);
      };
    }
  });

  return toolkit;
}

module.exports = {
  createToolkit,
};
