const db = require('../config/db');

exports.crearVenta = async (req, res) => {
    const { items } = req.body;
    const usuario_id = req.user.id;

    if (!items || !items.length) {
        return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        let total = 0;
        const detalles = [];

        for (const item of items) {
            const [rows] = await conn.query(
                'SELECT id, nombre, precio, stock FROM productos WHERE id = ? AND activo = 1',
                [item.producto_id]
            );
            if (!rows.length) {
                throw { status: 404, message: `Producto ID ${item.producto_id} no encontrado` };
            }
            const prod = rows[0];
            if (prod.stock < item.cantidad) {
                throw { status: 400, message: `Stock insuficiente para ${prod.nombre}. Disponible: ${prod.stock}` };
            }

            const subtotal = prod.precio * item.cantidad;
            total += subtotal;
            detalles.push({
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: prod.precio,
                subtotal
            });

            await conn.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.producto_id]
            );
        }

        const [ventaResult] = await conn.query(
            'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)',
            [usuario_id, total]
        );
        const venta_id = ventaResult.insertId;

        for (const det of detalles) {
            await conn.query(
                'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [venta_id, det.producto_id, det.cantidad, det.precio_unitario, det.subtotal]
            );
        }

        await conn.commit();

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id,
            total
        });
    } catch (error) {
        await conn.rollback();
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error('Error al crear venta:', error);
        res.status(500).json({ message: 'Error al registrar la venta' });
    } finally {
        conn.release();
    }
};

exports.listarVentas = async (req, res) => {
    try {
        const [ventas] = await db.query(
            `SELECT v.id, v.total, v.estado, v.created_at
             FROM ventas v
             WHERE v.usuario_id = ?
             ORDER BY v.created_at DESC`,
            [req.user.id]
        );

        for (const venta of ventas) {
            const [detalles] = await db.query(
                `SELECT dv.cantidad, dv.precio_unitario, dv.subtotal, p.nombre AS producto
                 FROM detalle_venta dv
                 JOIN productos p ON p.id = dv.producto_id
                 WHERE dv.venta_id = ?`,
                [venta.id]
            );
            venta.items = detalles;
        }

        res.json(ventas);
    } catch (error) {
        console.error('Error al listar ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas' });
    }
};

exports.obtenerVenta = async (req, res) => {
    try {
        const [ventas] = await db.query(
            `SELECT id, total, estado, created_at FROM ventas WHERE id = ? AND usuario_id = ?`,
            [req.params.id, req.user.id]
        );
        if (!ventas.length) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const [detalles] = await db.query(
            `SELECT dv.cantidad, dv.precio_unitario, dv.subtotal, p.nombre AS producto
             FROM detalle_venta dv
             JOIN productos p ON p.id = dv.producto_id
             WHERE dv.venta_id = ?`,
            [req.params.id]
        );

        res.json({ ...ventas[0], items: detalles });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error al obtener la venta' });
    }
};

exports.productosDisponibles = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.id, p.nombre, p.precio, p.stock, p.stock_minimo,
                    p.codigo_barras, p.imagen, p.fecha_vencimiento, c.nombre AS categoria
             FROM productos p
             LEFT JOIN categorias c ON c.id = p.categoria_id
             WHERE p.activo = 1
             ORDER BY p.nombre`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos disponibles:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};
