export NODE_ENV=test
export NODE_PORT=5000
export PORT=3000
export REACT_APP_BACKEND="http://localhost:$NODE_PORT"

export DISABLE_REQUST_LOGGER=true

# PostgreSQL database
export DATABASE_URL=postgres://ody:ody@localhost:5432/ody_management_platform_test

export REDIS_URL=redis://localhost:6379
