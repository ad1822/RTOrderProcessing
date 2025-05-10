#!/bin/bash

set -euo pipefail

# docker-compose down -v
#* Don't want to remove volumes
docker-compose down

docker volume rm rtorderprocessing_payment_db_data
docker volume rm rtorderprocessing_order_db_data

docker-compose up --build
