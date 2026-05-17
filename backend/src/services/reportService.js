const db = require('../config/db');

exports.inventoryReport = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.nombre,
                    c.nombre AS categoria,
                    p.stock,
                    p.stock_minimo,
                    p.precio,
                    (p.stock * p.precio) AS valor_total,
                    p.fecha_vencimiento
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.activo = TRUE
             ORDER BY c.nombre, p.nombre`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error inventoryReport:', err);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
};

exports.movementsReport = async (req, res) => {
    try {
        const { desde, hasta, tipo } = req.query;
        let sql = `
            SELECT m.fecha, p.nombre AS producto, m.tipo, m.cantidad,
                   m.stock_resultante, m.descripcion, u.nombre AS usuario
            FROM movimientos m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (desde) { sql += ' AND m.fecha >= ?'; params.push(desde); }
        if (hasta) { sql += ' AND m.fecha <= ?'; params.push(hasta); }
        if (tipo) { sql += ' AND m.tipo = ?'; params.push(tipo); }

        sql += ' ORDER BY m.fecha DESC LIMIT 500';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error movementsReport:', err);
        res.status(500).json({ message: 'Error al generar reporte de movimientos' });
    }
};

exports.salesReport = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        let sql = `
            SELECT v.id, v.total, v.estado, v.created_at,
                   u.nombre AS usuario, u.email AS email_usuario,
                   GROUP_CONCAT(
                       CONCAT(dv.cantidad, 'x ', p.nombre) SEPARATOR ', '
                   ) AS items
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
            LEFT JOIN productos p ON p.id = dv.producto_id
            WHERE 1=1
        `;
        const params = [];

        if (desde) { sql += ' AND v.created_at >= ?'; params.push(desde); }
        if (hasta) { sql += ' AND v.created_at <= ?'; params.push(hasta); }

        sql += ' GROUP BY v.id ORDER BY v.created_at DESC LIMIT 200';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error salesReport:', err);
        res.status(500).json({ message: 'Error al generar reporte de ventas' });
    }
};
