SELECT 'CREATE DATABASE havoc_nexus encoding "UTF8" template template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'havoc_nexus')\gexec

GRANT ALL PRIVILEGES ON DATABASE havoc_nexus to havoc;
