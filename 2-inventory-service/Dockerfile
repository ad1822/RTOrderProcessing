#! Install dependencies and build
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

#! Production Stage
FROM node:24-alpine

WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
COPY --from=build /app/build ./build

RUN npm ci --omit=dev

EXPOSE 3001

CMD ["npm", "start"]
