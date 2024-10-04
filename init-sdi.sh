#!/bin/sh

sudo -u postgres pg_ctl start -D /var/lib/postgresql/data

supervisord -c /etc/supervisord.conf

npm run migrate

node server.js
