# Base stage with common dependencies
FROM node:20-alpine AS base

WORKDIR /app

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

# Start development server with hot reload
CMD ["npm", "run", "start:dev"]