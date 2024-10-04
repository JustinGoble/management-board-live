# Node Application Dockerfile

FROM node:18-alpine
WORKDIR /usr/src/app

COPY . .
RUN rm .env

EXPOSE 80/tcp

CMD npm run migrate && node server.js