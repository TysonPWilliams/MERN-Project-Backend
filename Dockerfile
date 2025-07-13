# Shared between both development and production

FROM node:alpine AS base

WORKDIR /app

COPY package*json ./

RUN npm install

COPY . .

ARG PORT=3000
ENV PORT=${PORT}

EXPOSE 3000

CMD [ "npm", "start" ]

HEALTHCHECK --interval=10s --retries=5 \ 
    CMD wget http://localhost:${PORT}/health || exit 1
    
# Production stage

# FROM base as production
# ENV NODE_ENV=production

# RUN npm ci --only=production

# COPY . .

# EXPOSE 3000
# CMD [ "node", "index.js" ]

# FROM node:alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# # Dockerfile expects ARG valuse to be provided by docker-compose
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}

# ARG NODE_ENV
# ENV NODE_ENV=${NODE_ENV}

# ARG PORT
# ENV PORT=${PORT}

# CMD [ "npm", "run", "dev" ]

# EXPOSE ${PORT}

