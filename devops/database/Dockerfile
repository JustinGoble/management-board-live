# Database Dockerfile

FROM postgres:alpine

WORKDIR /docker-entrypoint-initdb.d

COPY ./init-database.sql ./init-database.sql

WORKDIR /var/lib/postgres/data

EXPOSE 6379

VOLUME /var/lib/postgres/data