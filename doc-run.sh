#!/bin/bash

set -euo pipefail

# echo "Stopping and removing containers, networks, and volumes..."
docker-compose down -v

echo "Rebuilding and starting containers..."
docker-compose up --build
