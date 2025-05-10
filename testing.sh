#!/bin/bash

for i in $(seq 1 24)
do
    random_num=$((RANDOM % 10000))
    orderId=$((i * 10 * 10000 + random_num))
    
    curl -X POST http://localhost:3000/produce \
    -H "Content-Type: application/json" \
    -d "{
                \"userId\": \"BOT\",
                \"itemId\": 9,
                \"orderId\": $orderId,
                \"quantity\": 2
    }"
done
