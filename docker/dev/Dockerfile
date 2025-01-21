# Use the official Node.js image as a base image
FROM node:23-bullseye

LABEL org.opencontainers.image.authors="cativo23.kt@gmail.com"

# Set environment variables
ENV NODE_ENV=development

# Install dependencies
RUN apt-get update && apt-get install -y \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Ensure that the user exists and matches the host's UID and GID
RUN echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Set user to avoid permission issues
USER node

# Set the working directory
WORKDIR /home/node/app

# Copy package.json and yarn-lock.json to install dependencies
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

# Install dependencies
RUN yarn install
RUN yarn global add @nestjs/cli

# Add yarn global bin to the PATH
ENV PATH /home/node/.yarn/bin:$PATH

# Copy the project files
COPY --chown=node:node . .

# Expose the development port
EXPOSE 3001

# Run Nuxt in development mode
CMD ["yarn", "run", "start:debug", "--host"]