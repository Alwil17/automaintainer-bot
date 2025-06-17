# Étape 1 : build
FROM node:20-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
RUN npm cache clean --force
ENV NODE_ENV=production
COPY . .

# Étape 2 : run
FROM node:20-slim
WORKDIR /usr/src/app
COPY --from=build /usr/src/app /usr/src/app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
