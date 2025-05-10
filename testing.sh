#!/bin/bash

for i in $(seq 1 24)
do
    
    curl -X POST http://localhost:3000/produce \
    -H "Content-Type: application/json" \
    -d "{
                \"userId\": \"BOT-NOT-$i\",
                \"itemId\": 6,
                \"quantity\": 2
    }"
done
