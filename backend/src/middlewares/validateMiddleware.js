exports.validateProduct = (req, res, next) => {
    const { nombre, precio } = req.body;
    const errors = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (precio === undefined || isNaN(precio) || Number(precio) < 0) {
        errors.push('El precio debe ser un número positivo');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

exports.validateMovement = (req, res, next) => {
    const { producto_id, tipo, cantidad } = req.body;
    const errors = [];

    if (!producto_id || isNaN(producto_id)) {
        errors.push('producto_id es requerido');
    }
    if (!tipo || !['entrada', 'salida'].includes(tipo)) {
        errors.push('El tipo debe ser "entrada" o "salida"');
    }
    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
        errors.push('La cantidad debe ser un número positivo');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

exports.validateCategory = (req, res, next) => {
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        return res.status(400).json({ errors: ['El nombre debe tener al menos 2 caracteres'] });
    }
    next();
};

exports.validateRegister = (req, res, next) => {
    const { nombre, email, password } = req.body;
    const errors = [];

    if (!nombre || nombre.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email inválido');
    }
    if (!password || password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};
