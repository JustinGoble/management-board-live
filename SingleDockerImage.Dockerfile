# All in One Nexus Dockerfile

FROM alpine
WORKDIR /usr/src/app

COPY . .
RUN source .env

EXPOSE 80/tcp

RUN apk update
RUN apk add nodejs npm
RUN apk add redis
RUN apk add postgresql
RUN apk add sudo
RUN apk add supervisor

WORKDIR /var/lib/postgres/data

COPY ./devops/database/init-database.sql ./init-database.sql

RUN cat ./init-database.sql
RUN mkdir /run/postgresql
RUN chown postgres:postgres /run/postgresql/

USER postgres

RUN initdb -D /var/lib/postgresql/data
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

RUN source /usr/src/app/.env \
    && pg_ctl start -D /var/lib/postgresql/data \
    && psql -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD'" \
    && psql < ./init-database.sql

VOLUME [ "/var/lib/postgresql/data" ]

USER root

WORKDIR /usr/src/app
RUN rm .env

RUN chmod +x ./init-sdi.sh

# general config for supervisord

RUN mkdir -p /etc/supervisord.d

RUN echo  $'[supervisord] \n\
logfile = /tmp/supervisord.log \n\
logfile_maxbytes = 50MB \n\
logfile_backups=10 \n\
loglevel = info \n\ 
pidfile = /tmp/supervisord.pid \n\
nodaemon = false \n\
umask = 022 \n\
identifier = supervisor \n\
[supervisorctl] \n\
serverurl = unix:///tmp/supervisor.sock \n\
[rpcinterface:supervisor] \n\
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface \n\
[include] \n\
files = /etc/supervisord.d/*.conf' >> /etc/supervisord.conf

# starting redis-server using supervisor d

RUN echo $'[supervisord] \n\
nodaemon=false \n\
[program:redis] \n\
command=redis-server /etc/redis.conf \n\
autostart=true \n\
autorestart=true \n\
stdout_logfile=/var/log/redis/stdout.log \n\
stdout_logfile_maxbytes=0MB \n\ 
stderr_logfile=/var/log/redis/stderr.log \n\
stderr_logfile_maxbytes=10MB \n\
exitcodes=0 ' >> /etc/supervisord.d/redis.conf

CMD ./init-sdi.sh