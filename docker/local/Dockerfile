# --------------------------------------------
# Development Docker image for local development
# --------------------------------------------
FROM node:lts-alpine

# Turbo cache configuration
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Log start of setup
RUN echo "🔵 Starting development image setup..."

# Install optional compatibility package for native dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn & PNPM if needed
RUN corepack enable

# Copy package manager files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Copy all workspace files for proper monorepo setup
COPY apps ./apps

COPY .env.local ./apps/pencily/.env
COPY packages ./packages

# Install dependencies
RUN yarn install

# Copy all application source code
COPY . .

# Build the packages
RUN yarn build

# Create .env file if .env.local exists, otherwise create a basic one
RUN if [ -f .env.local ]; then cp .env.local .env; else echo "NODE_ENV=development" > .env; fi

# Log completion of setup
RUN echo "✅ Development image setup completed"

# Expose the port the app will run on
EXPOSE 3000

# Set development environment
ENV NODE_ENV=development
ENV PORT=3000

# Start the Next.js development server
CMD ["yarn", "dev"]

