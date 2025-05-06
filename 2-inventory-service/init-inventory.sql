-- init-inventory.sql
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  itemId INTEGER,
  quantity INT NOT NULL
);

INSERT INTO inventory (itemId, quantity) VALUES
(1, 10),
(2, 25),
(3, 50);
