#!/usr/bin/fish

set -x COMMIT_HASH (git rev-parse --short HEAD)
set -x NEW_RELIC_LICENSE_KEY (cat development.env | grep NEW_RELIC_LICENSE_KEY | cut -d '=' -f 2)
docker compose --file development.compose.yml --env-file development.env up -d --build
