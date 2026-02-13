# Base stage with common dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Install postgresql-client and curl for database and rabbitmq health checks
RUN apk add --no-cache postgresql-client curl

# Copy package files
COPY package*.json ./

# Development stage - for docker-compose development
FROM base AS development

# Clean install all dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Expose application and debug ports
EXPOSE 3001 9229

# Wait for services and ensure RabbitMQ queue exists before starting
CMD sh -c "until PGPASSWORD=\${DATABASE_PASSWORD} pg_isready -h \${DATABASE_HOST} -p \${DATABASE_PORT} -U \${DATABASE_USER}; do echo 'Waiting for postgres...'; sleep 2; done && \
    echo 'Postgres ready!' && \
    until curl -u \${RABBITMQ_DEFAULT_USER}:\${RABBITMQ_DEFAULT_PASS} -f http://rabbitmq:15672/api/healthchecks/node 2>/dev/null; do echo 'Waiting for RabbitMQ management...'; sleep 2; done && \
    echo 'RabbitMQ ready! Creating queue...' && \
    curl -u \${RABBITMQ_DEFAULT_USER}:\${RABBITMQ_DEFAULT_PASS} -X PUT http://rabbitmq:15672/api/queues/%2F/\${RABBITMQ_QUEUE} -H 'content-type: application/json' -d '{\"durable\":true}' && \
    echo 'Queue created! Starting application...' && \
    nest start --watch"