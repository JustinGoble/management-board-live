#!/bin/bash
# NOTE: Run this only from the project root

EXIT_STATUS=0

source ./environments/test-ci.sh || EXIT_STATUS=$?

echo -e "\n------ Linting code..\n"
npm run lint || EXIT_STATUS=$?

echo -e "\n------ Running tests..\n"
npm run mocha || EXIT_STATUS=$?

exit $EXIT_STATUS
