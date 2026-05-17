# CafeSys

Sistema multiplataforma de gestión de inventario para cafeterías.  
Desarrollado con **React** (Web), **React Native** (Móvil) y **Node.js/Express** (Backend).

## Tecnologías

| Plataforma | Tecnologías |
|------------|-------------|
| **Frontend Web** | React, Vite, TailwindCSS, Axios |
| **App Móvil** | React Native, Expo, Axios |
| **Backend** | Node.js, Express, JWT, MySQL |
| **Base de Datos** | MySQL |

## Estructura del Proyecto

```
Proyecto_Catedra_DPS441/
├── backend/            # API REST (Express + MySQL)
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Autenticación, validación
│   │   ├── services/       # Servicios auxiliares
│   │   ├── config/         # Conexión a BD
│   │   └── utils/          # Utilidades (JWT, etc.)
│   └── .env               # Variables de entorno
├── frontend-web/       # Panel web (React + Vite)
│   └── src/
│       ├── pages/         # Login, Dashboard, Productos, etc.
│       ├── components/    # Formularios, tablas, etc.
│       ├── services/      # Consumo de API
│       └── layouts/       # Layout del dashboard
├── mobile-app/         # App móvil (React Native + Expo)
│   └── src/ (screens/)
│       ├── screens/       # Pantallas de la app
│       ├── services/      # Consumo de API
│       ├── navigation/    # Navegación
│       ├── context/       # Contexto de autenticación
│       └── components/    # Componentes reutilizables
├── database/           # Scripts SQL
└── docs/               # Documentación
```

## Funcionalidades

- Autenticación con JWT (Login seguro)
- CRUD de productos y categorías
- Control de stock y stock mínimo
- Alertas de inventario bajo
- Registro de movimientos (entradas/salidas)
- Dashboard con gráficos y estadísticas
- Ventas y carrito de compras (cliente)
- Escáner de código de barras (móvil)
- Reportes de inventario
- Subida de imágenes para productos

## Instalación y Ejecución

### Requisitos

- Node.js 18+
- MySQL
- Expo CLI (para app móvil)

### 1. Base de Datos

```bash
# Crea la base de datos en MySQL y ejecuta:
mysql -u root -p < database/cafeteria_inventory.sql
mysql -u root -p < database/inserts.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Edita `backend/.env` con tus credenciales de MySQL:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=cafeteria_inventory
DB_PORT=3306
JWT_SECRET=tu_secreto
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend Web

```bash
cd frontend-web
npm install
npm run dev
```

Abrir en `http://localhost:5173`

### 4. App Móvil

```bash
cd mobile-app
npm install
```

Edita `mobile-app/services/config.js` con la IP de tu PC:

```js
const API_URL = 'http://192.168.x.x:4000/api';
```

```bash
npx expo start
```

Escanea el QR con tu teléfono.

## Usuario por Defecto

| Nombre | Email | Contraseña | Rol |
|--------|-------|------------|-----|
| Admin CafeSys | `admin@cafesys.com` | `admin123` | Admin |

## Documentación

- [Documentación Técnica](./docs/documentacion.md)
- [Manual de Usuario](./docs/manual-de-usuario.md)

## Licencia

Proyecto académico — DPS441
