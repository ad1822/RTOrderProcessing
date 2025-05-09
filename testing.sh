#!/bin/bash

for i in $(seq 1 10)
do
    curl -X POST http://localhost:3000/produce \
    -H "Content-Type: application/json" \
    -d '{
            "userId": "F",
            "itemId": 1,
            "orderId": '"$i"',
            "quantity": 1
    }'
    # sleep 5
done
