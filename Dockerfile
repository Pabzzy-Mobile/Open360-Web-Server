FROM node:10.5.0

ARG PORT
ENV PORT=$PORT

WORKDIR /app
COPY package.json .
RUN npm install
COPY main.js .
COPY public ./public
COPY core ./core

EXPOSE $PORT
EXPOSE 443

CMD [ "npm", "start" ]