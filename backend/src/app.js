const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const movementRoutes = require('./routes/movementRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const ventaRoutes = require('./routes/ventaRoutes');

const path = require('path');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/movimientos', movementRoutes);
app.use('/api/alertas', alertRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/ventas', ventaRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
