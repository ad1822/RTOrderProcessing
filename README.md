## Services

```mermaid
graph TD
  order-service --> inventory-service
  inventory-service --> shipping-service
  shipping-service --> payment-service
  payment-service --> notification-service
```
