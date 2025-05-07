#!/bin/bash

echo "Select a database to query:"
echo "1) Inventory DB"
echo "2) Payment DB"
echo "3) Order DB"
read -rp "Enter choice : " choice

case $choice in
    1)
        CONTAINER="inventory-database"
        USER="inventoryuser"
        DB="inventories"
        TABLE="inventory"
    ;;
    2)
        CONTAINER="payment-database"
        USER="paymentuser"
        DB="payments"
        TABLE="payment"
    ;;
    3)
        CONTAINER="order-database"
        USER="orderuser"
        DB="orders"
        TABLE="orders"
    ;;
    *)
        echo "Invalid choice."
        exit 1
    ;;
esac

docker exec -it "$CONTAINER" psql -U "$USER" -d "$DB" -c "SELECT * FROM $TABLE;"
