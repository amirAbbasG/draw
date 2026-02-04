# Docker Development Environment

This directory contains the Docker configuration for the Pencilly frontend project. The setup follows Turborepo best practices for monorepo Docker builds.

## Local Development

This setup is configured to be built with Docker and Docker Compose following Turborepo best practices.

### Prerequisites

- Docker and Docker Compose installed
- Yarn package manager

### Quick Start

```bash
# Install dependencies
yarn install

# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create app_network

# Build prod using new BuildKit engine
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker/local/docker-compose.yml build

# Start prod in detached mode
docker-compose -f docker/local/docker-compose.yml up -d
```

Open http://localhost:3000 to access the application.

### Remote Caching (Optional)

This setup includes optional remote caching with Turborepo. To enable it:

1. Get your TURBO_TEAM and TURBO_TOKEN from Vercel
2. Set environment variables:
   ```bash
   export TURBO_TEAM="your-team-name"
   export TURBO_TOKEN="your-token"
   ```
3. Build with remote caching:
   ```bash
   COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker/local/docker-compose.yml build
   ```

### Shutdown

To shutdown all running containers:

```bash
docker-compose -f docker/local/docker-compose.yml down
```

## For the first time, if you want to run the project in widnows without database and other services, you can run:

```bash
# this will remove all volumes and containers
docker compose -f docker/development/docker-compose.yml down -v
docker compose -f docker/staging/docker-compose.yml down -v
docker compose -f docker/production/docker-compose.yml down -v
```

## this will remove all volumes and containers

```bash
docker compose -f docker/development/docker-compose.yml down --volumes --rmi all
docker compose -f docker/staging/docker-compose.yml down --volumes --rmi all
docker compose -f docker/production/docker-compose.yml down --volumes --rmi all
```

an optional command to remove all images:

```bash
# docker builder prune -f
```

## How to Use

To start all services:

for .env will build the project with development environment variables:

```bash
docker compose --env-file .env.development -f docker/development/docker-compose.yml up --build -d
```

For Staging or Production environments, you can use the following commands:

```bash
docker compose --env-file .env.staging -f docker/staging/docker-compose.yml up --build -d
```

```bash
docker compose --env-file .env.production -f docker/production/docker-compose.yml up --build -d
```
