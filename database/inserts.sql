USE cafeteria_inventory;

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Café', 'Bebidas y granos de café'),
('Postres', 'Pasteles, galletas y dulces'),
('Lácteos', 'Leche, crema, yogur y derivados'),
('Bebidas Frías', 'Refrescos, jugos y aguas'),
('Panadería', 'Pan, baguettes y sandwiches');

-- Insertar productos
INSERT INTO productos (nombre, categoria_id, stock, stock_minimo, precio, fecha_vencimiento, codigo_barras) VALUES
('Café Espresso',     1, 50, 10, 2.50, '2026-12-31', '750100000001'),
('Café Latte',        1, 40, 10, 3.00, '2026-12-31', '750100000002'),
('Café Capuchino',      1, 35, 10, 3.50, '2026-12-31', '750100000003'),
('Leche Entera',      3, 20,  5, 1.20, '2026-06-20', '750100000004'),
('Leche Deslactosada', 3, 15,  5, 1.50, '2026-06-20', '750100000005'),
('Pastel de Chocolate', 2,  8,  3, 4.50, '2026-05-15', '750100000006'),
('Croissant',         5, 12,  5, 2.00, '2026-05-10', '750100000007'),
('Jugo de Naranja',   4, 25, 10, 2.00, '2026-06-01', '750100000008');

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES
('Admin CafeSys', 'admin@cafesys.com', '$2b$10$9pHV5G/GzDua/q29ht676eBehs7GQElrmjYPXNlshfiiHYSIIUZlW', 'admin', '555-0100');
-- Contraseña: admin123 (hash bcrypt generado)

-- Insertar movimientos de ejemplo
INSERT INTO movimientos (producto_id, tipo, cantidad, stock_resultante, descripcion, usuario_id) VALUES
(1, 'entrada', 50, 50, 'Compra inicial', 1),
(2, 'entrada', 40, 40, 'Compra inicial', 1),
(4, 'entrada', 20, 20, 'Compra inicial', 1),
(6, 'entrada',  8,  8, 'Compra inicial', 1);
