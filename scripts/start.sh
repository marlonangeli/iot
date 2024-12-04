#!/bin/bash

# Change to project root directory
cd "$(dirname "$(readlink -f "$0")")/.."

# Function to display correct script usage
show_usage() {
   echo "Usage: ./scripts/start.sh [dev|staging|production]"
   exit 1
}

# Default to development if no argument provided
ENV=${1:-dev}

# Set variables based on environment
case $ENV in
   dev)
       ENV_FILE="development.env"
       COMPOSE_FILE="development.compose.yml"
       ;;
   staging)
       ENV_FILE="staging.env"
       COMPOSE_FILE="staging.compose.yml"
       ;;
   production)
       ENV_FILE=".env"
       COMPOSE_FILE="production.compose.yml"
       ;;
   *)
       show_usage
       ;;
esac

# Validate prerequisites
validate_prerequisites() {
   if ! command -v git &> /dev/null; then
       echo "Error: Git is not installed."
       exit 1
   fi

   if ! command -v docker &> /dev/null; then
       echo "Error: Docker is not installed."
       exit 1
   fi

   if [[ ! -f "$ENV_FILE" ]]; then
       echo "Error: Environment file $ENV_FILE not found."
       exit 1
   fi

   if [[ ! -f "$COMPOSE_FILE" ]]; then
       echo "Error: Docker Compose file $COMPOSE_FILE not found."
       exit 1
   fi
}

# Validate prerequisites
validate_prerequisites

# Set environment variables
export COMMIT_HASH=$(git rev-parse --short HEAD)
export NEW_RELIC_LICENSE_KEY=$(grep NEW_RELIC_LICENSE_KEY "$ENV_FILE" | cut -d '=' -f 2)

# Check New Relic key
if [[ -z "$NEW_RELIC_LICENSE_KEY" ]]; then
   echo "Warning: New Relic key not found in environment file."
fi

# Run Docker Compose
echo "Starting containers for environment: $ENV"
docker compose --file "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# Check Docker execution status
DOCKER_STATUS=$?
if [[ $DOCKER_STATUS -eq 0 ]]; then
   echo "Containers started successfully!"
else
   echo "Error starting containers. Status code: $DOCKER_STATUS"
   exit $DOCKER_STATUS
fi
