# Frontend Dockerfile
#
# This Dockerfile builds the Next.js application for Portal Lab. The app
# uses the Next.js App Router and Material UI. During the build phase the
# TypeScript sources are transpiled and static pages are generated. The
# resulting production build is served via `next start`.

FROM node:18-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY next.config.js ./
COPY next-env.d.ts ./
COPY src ./src
COPY app ./app

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]