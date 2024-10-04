const _ = require('lodash');
const path = require('path');
const YAML = require('yamljs');
const jsonRefs = require('json-refs');
const logger = require('./logger')(__filename);

function load(filePath) {
  logger.debug('Loading documentation in path', filePath);
  const dirName = path.dirname(filePath);
  const documentation = YAML.load(filePath);

  // Finding all relative references
  const remoteRefs = jsonRefs.findRefs(
    documentation,
    { filter: ['relative'] },
  );

  // Resolve all found references
  _.forEach(remoteRefs, (unresolvedRefDetails, jsonPointer) => {
    logger.debug('Found a relative $ref pointing to', unresolvedRefDetails.uri);
    const refPath = path.resolve(dirName, unresolvedRefDetails.uri);

    // Load the referenced documentation
    const refDoc = load(refPath);

    // Insert loaded documentation back to the original documentation
    // to the location defined by the JSON pointer
    const jsonPathSegments = jsonRefs.pathFromPtr(jsonPointer);
    logger.debug(
      'Inserting the loaded doc to JSON path',
      JSON.stringify(jsonPathSegments),
    );
    _.set(documentation, jsonPathSegments, refDoc);
  });

  if (_.isArray(documentation)) {
    logger.debug('The loaded document is an array, merging components');
    return _.merge(...documentation);
  }

  return documentation;
}

module.exports = {
  load,
};
