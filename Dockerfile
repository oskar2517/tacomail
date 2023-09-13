FROM node:18 AS base
WORKDIR /app

FROM base AS build-client
COPY ./client/package*.json ./
RUN npm install
COPY ./client .
RUN npm run build

FROM base AS server
COPY ./package*.json ./
RUN npm install
COPY . .
COPY --from=build-client /app /app/client

EXPOSE 80
EXPOSE 25
CMD ["node", "index.js"]