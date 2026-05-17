const db = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.nombre AS categoria
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.activo = TRUE
             ORDER BY p.nombre`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error getProducts:', err);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT p.*, c.nombre AS categoria
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error getProductById:', err);
        res.status(500).json({ message: 'Error al obtener producto' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { nombre, categoria_id, stock, stock_minimo, precio, fecha_vencimiento, codigo_barras } = req.body;
        const imagen = req.file ? req.file.filename : null;

        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        if (codigo_barras) {
            const [existing] = await db.query('SELECT id FROM productos WHERE codigo_barras = ?', [codigo_barras]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'El código de barras ya existe' });
            }
        }

        const [result] = await db.query(
            `INSERT INTO productos (nombre, categoria_id, stock, stock_minimo, precio, fecha_vencimiento, codigo_barras, imagen)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, categoria_id || null, stock || 0, stock_minimo || 5, precio, fecha_vencimiento || null, codigo_barras || null, imagen]
        );

        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    } catch (err) {
        console.error('Error createProduct:', err);
        res.status(500).json({ message: 'Error al crear producto' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['nombre', 'categoria_id', 'stock', 'stock_minimo', 'precio', 'fecha_vencimiento', 'codigo_barras', 'imagen'];
        const fields = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                fields[key] = req.body[key];
            }
        }

        if (req.file) {
            fields.imagen = req.file.filename;
        }

        if (fields.codigo_barras) {
            const [existing] = await db.query(
                'SELECT id FROM productos WHERE codigo_barras = ? AND id != ?',
                [fields.codigo_barras, id]
            );
            if (existing.length > 0) {
                return res.status(409).json({ message: 'El código de barras ya está en uso' });
            }
        }

        const [result] = await db.query('UPDATE productos SET ? WHERE id = ?', [fields, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        console.error('Error updateProduct:', err);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        console.error('Error deleteProduct:', err);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
};
