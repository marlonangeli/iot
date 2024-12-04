#!/bin/bash

# Change to project root directory
cd "$(dirname "$(readlink -f "$0")")/.."

# Function to display correct script usage
show_usage() {
   echo "Usage: ./scripts/stop.sh [dev|staging|production] [--down]"
   exit 1
}

# Default to development if no argument provided
ENV=${1:-dev}
COMMAND="stop"

# Check for --down flag
if [[ "$2" == "--down" ]]; then
   COMMAND="down"
fi

# Set variables based on environment
case $ENV in
   dev)
       COMPOSE_FILE="development.compose.yml"
       ;;
   staging)
       COMPOSE_FILE="staging.compose.yml"
       ;;
   production)
       COMPOSE_FILE="production.compose.yml"
       ;;
   *)
       show_usage
       ;;
esac

# Run Docker Compose stop or down
echo "Stopping containers for environment: $ENV (mode: $COMMAND)"
docker compose --file "$COMPOSE_FILE" "$COMMAND"

# Check Docker execution status
DOCKER_STATUS=$?
if [[ $DOCKER_STATUS -eq 0 ]]; then
   echo "Containers stopped successfully!"
else
   echo "Error stopping containers. Status code: $DOCKER_STATUS"
   exit $DOCKER_STATUS
fi
