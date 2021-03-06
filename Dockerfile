FROM node:lts-alpine

COPY package.json /app/package.json
RUN cd /app && npm install
COPY .babelrc /app/.babelrc

COPY src /app/src

WORKDIR /app
RUN npm run build

CMD ["npm", "start"]
