FROM node:14.15.0-alpine3.12

ARG PORT
ENV PORT=$PORT

WORKDIR /app
COPY package.json .
RUN npm install
COPY main.js .
COPY public ./public
COPY core ./core
COPY views ./views

EXPOSE $PORT

CMD [ "node", "main.js" ]
