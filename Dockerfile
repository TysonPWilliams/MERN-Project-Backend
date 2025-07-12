FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Dockerfile expects ARG valuse to be provided by docker-compose
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG PORT
ENV PORT=${PORT}

CMD [ "npm", "run", "dev" ]

EXPOSE ${PORT}

HEALTHCHECK --interval=10s --retries=5 \ 
    CMD wget http://localhost:${PORT}/health || exit 1