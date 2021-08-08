FROM node:12-alpine AS build

WORKDIR /srv
COPY package.json /srv
COPY yarn.lock /srv/yarn.lock
RUN yarn install --frozen-lockfile
COPY tsconfig.json /srv/
COPY src /srv/src/
RUN yarn build
RUN yarn install --frozen-lockfile --production

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /srv
COPY --from=build /srv/node_modules /srv/node_modules
COPY --from=build /srv/dist /srv/dist
CMD [ "node", "-r", "dotenv/config", "dist/server.js" ]