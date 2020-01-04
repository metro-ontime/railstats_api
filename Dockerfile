FROM node:lts-alpine

COPY package.json /app/package.json
RUN cd /app && npm install

COPY . /app

WORKDIR /app
RUN npm run build

ENV PORT 8080
EXPOSE  8080
CMD ["npm", "start"]
