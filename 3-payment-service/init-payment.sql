CREATE TABLE IF NOT EXISTS payment (
  id SERIAL PRIMARY KEY,
  userId TEXT,
  itemId INTEGER,
  orderId INTEGER,
  quantity INT NOT NULL,
  status TEXT
);

INSERT INTO payment (userId, itemId, orderId, quantity, status) VALUES
("AAAA", 100, 100, 100, 'PENDING');
