# Multi-stage build for production
FROM node:24-bookworm AS builder

RUN npm install -g corepack
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --immutable

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:24-bookworm

RUN npm install -g corepack
RUN corepack enable && corepack prepare yarn@stable --activate

LABEL org.opencontainers.image.authors="cativo23.kt@gmail.com"

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --immutable --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN useradd -m -u 1000 node && chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run the application
CMD ["yarn", "start:prod"]