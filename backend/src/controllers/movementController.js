const db = require('../config/db');

exports.getMovements = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT m.*, p.nombre AS producto, u.nombre AS usuario
             FROM movimientos m
             LEFT JOIN productos p ON m.producto_id = p.id
             LEFT JOIN usuarios u ON m.usuario_id = u.id
             ORDER BY m.fecha DESC
             LIMIT 200`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error getMovements:', err);
        res.status(500).json({ message: 'Error al obtener movimientos' });
    }
};

exports.createMovement = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { producto_id, tipo, cantidad, descripcion } = req.body;
        const usuario_id = req.user?.id || req.body.usuario_id;

        await conn.beginTransaction();

        // Verificar producto
        const [products] = await conn.query(
            'SELECT id, stock, nombre FROM productos WHERE id = ? AND activo = TRUE FOR UPDATE',
            [producto_id]
        );

        if (products.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const product = products[0];

        // Validar stock suficiente para salidas
        if (tipo === 'salida' && product.stock < cantidad) {
            await conn.rollback();
            return res.status(400).json({
                message: `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${cantidad}`
            });
        }

        // Calcular nuevo stock
        const nuevoStock = tipo === 'entrada'
            ? product.stock + Number(cantidad)
            : product.stock - Number(cantidad);

        // Actualizar stock
        await conn.query(
            'UPDATE productos SET stock = ? WHERE id = ?',
            [nuevoStock, producto_id]
        );

        // Registrar movimiento
        const [result] = await conn.query(
            `INSERT INTO movimientos (producto_id, tipo, cantidad, stock_resultante, descripcion, usuario_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [producto_id, tipo, cantidad, nuevoStock, descripcion || null, usuario_id || null]
        );

        await conn.commit();

        res.status(201).json({
            message: 'Movimiento registrado',
            id: result.insertId,
            stock_actual: nuevoStock
        });
    } catch (err) {
        await conn.rollback();
        console.error('Error createMovement:', err);
        res.status(500).json({ message: 'Error al registrar movimiento' });
    } finally {
        conn.release();
    }
};
