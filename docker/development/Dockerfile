# --------------------------------------------
# Development Docker image for local development
# --------------------------------------------
FROM node:lts-alpine

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
COPY packages ./packages
# Copy development environment
COPY .env.development ./apps/pencilly_react/.env

# Install dependencies
RUN yarn install
# Install serve globally to serve the built app
RUN npm i -g serve

# Copy all application source code
COPY . .

# Build workspace packages and apps
RUN yarn build

# Log completion of setup
RUN echo "✅ Development image setup completed"

# Expose the port the app will run on
EXPOSE 3000

# Set development environment
ENV NODE_ENV=production
ENV DEV=true
ENV VITE_PORT=3000

CMD ["yarn",  "start"]

