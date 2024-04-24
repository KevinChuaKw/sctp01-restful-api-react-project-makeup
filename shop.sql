
use shops;
-- SQL file for creating and manipulating a simple products table
-- DDL to create the products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL
);

-- DML to insert initial data into the products table
INSERT INTO products (product_name, description, price, stock_quantity) VALUES
('Widget', 'A useful widget', 19.99, 100),
('Gadget', 'An essential gadget', 29.99, 150),
('Doohickey', 'A necessary doohickey', 9.99, 200);

