const db = require('../config/db');

exports.lowStock = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.nombre AS categoria
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.activo = TRUE AND p.stock <= p.stock_minimo
             ORDER BY (p.stock_minimo - p.stock) DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error lowStock:', err);
        res.status(500).json({ message: 'Error al obtener alertas' });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const [totalProducts] = await db.query(
            'SELECT COUNT(*) AS total FROM productos WHERE activo = TRUE'
        );
        const [lowStock] = await db.query(
            'SELECT COUNT(*) AS total FROM productos WHERE activo = TRUE AND stock <= stock_minimo'
        );
        const [totalCategories] = await db.query('SELECT COUNT(*) AS total FROM categorias');
        const [recentMovements] = await db.query(
            'SELECT COUNT(*) AS total FROM movimientos WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        const [totalStock] = await db.query(
            'SELECT SUM(stock) AS total FROM productos WHERE activo = TRUE'
        );
        const [totalValue] = await db.query(
            'SELECT SUM(stock * precio) AS total FROM productos WHERE activo = TRUE'
        );

        res.json({
            total_productos: totalProducts[0].total,
            alertas_stock: lowStock[0].total,
            total_categorias: totalCategories[0].total,
            movimientos_recientes: recentMovements[0].total,
            stock_total: totalStock[0].total || 0,
            valor_inventario: totalValue[0].total || 0
        });
    } catch (err) {
        console.error('Error getSummary:', err);
        res.status(500).json({ message: 'Error al obtener resumen' });
    }
};
