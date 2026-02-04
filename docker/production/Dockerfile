# --------------------------------------------
# Production Docker image
# --------------------------------------------
FROM node:lts-alpine

RUN echo "🔵 Starting production image setup..."

# Install dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable Corepack
RUN corepack enable

# Copy package files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./


# Copy workspace structure
COPY apps ./apps
COPY packages ./packages
# Copy production environment
COPY .env.production ./apps/pencilly_react/.env

# Install dependencies
RUN yarn install --frozen-lockfile
# Install serve globally to serve the built app
RUN npm i -g serve

# Copy application source
COPY . .

# Build workspace packages and apps
RUN yarn build

# Log completion of setup
RUN echo "✅ Production image setup completed"

# Expose port
EXPOSE 3010

# Set production environment
ENV NODE_ENV=production
ENV DEV=false
ENV VITE_PORT=3010

# Start Next.js production server
CMD ["yarn",  "start"]