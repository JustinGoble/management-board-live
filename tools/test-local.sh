#!/bin/bash
# NOTE: Run this only from the project root

EXIT_STATUS=0

source ./environments/test-local.sh || EXIT_STATUS=$?

npm run lint || EXIT_STATUS=$?

npm run mocha || EXIT_STATUS=$?

exit $EXIT_STATUS
