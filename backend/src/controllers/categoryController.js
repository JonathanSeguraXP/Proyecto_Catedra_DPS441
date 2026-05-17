const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.*, COUNT(p.id) AS total_productos
             FROM categorias c
             LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = TRUE
             GROUP BY c.id
             ORDER BY c.nombre`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error getCategories:', err);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const [existing] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [nombre]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'La categoría ya existe' });
        }

        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null]
        );

        res.status(201).json({ message: 'Categoría creada', id: result.insertId });
    } catch (err) {
        console.error('Error createCategory:', err);
        res.status(500).json({ message: 'Error al crear categoría' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const [existing] = await db.query('SELECT id FROM categorias WHERE nombre = ? AND id != ?', [nombre, id]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Ya existe otra categoría con ese nombre' });
        }

        const [result] = await db.query('UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría actualizada' });
    } catch (err) {
        console.error('Error updateCategory:', err);
        res.status(500).json({ message: 'Error al actualizar categoría' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query('SELECT COUNT(*) AS count FROM productos WHERE categoria_id = ? AND activo = TRUE', [id]);
        if (products[0].count > 0) {
            return res.status(400).json({ message: 'No se puede eliminar: hay productos en esta categoría' });
        }

        const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría eliminada' });
    } catch (err) {
        console.error('Error deleteCategory:', err);
        res.status(500).json({ message: 'Error al eliminar categoría' });
    }
};
