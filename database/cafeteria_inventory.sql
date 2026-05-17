CREATE DATABASE IF NOT EXISTS cafeteria_inventory
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cafeteria_inventory;

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'empleado',
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ============================================================
-- CATEGORIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria_id INT,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_vencimiento DATE,
    codigo_barras VARCHAR(100) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_categoria (categoria_id),
    INDEX idx_activo (activo),
    INDEX idx_stock (stock, stock_minimo),
    INDEX idx_codigo_barras (codigo_barras)
) ENGINE=InnoDB;

-- ============================================================
-- MOVIMIENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    stock_resultante INT NOT NULL DEFAULT 0,
    descripcion VARCHAR(255),
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_producto (producto_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB;
