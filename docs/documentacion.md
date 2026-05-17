# Documentación Técnica

## Arquitectura del Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend Web   │────▶│   Backend API    │────▶│   MySQL BD   │
│  (React+Vite)   │     │  (Node+Express)  │     │              │
├─────────────────┤     ├──────────────────┤     ├──────────────┤
│  App Móvil      │────▶│   Puerto 4000    │     │  cafeteria_  │
│  (React Native) │     │   REST API       │     │  inventory   │
└─────────────────┘     └──────────────────┘     └──────────────┘
```

## Backend (API REST)

### Tecnologías

- **Node.js** con **Express 5**
- **MySQL2** para conexión a base de datos
- **JWT** para autenticación
- **Multer** para subida de archivos
- **Bcryptjs** para encriptación de contraseñas
- **CORS** para comunicación entre dominios

### Rutas de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| GET | `/api/productos` | Listar productos | Sí |
| POST | `/api/productos` | Crear producto | Sí |
| PUT | `/api/productos/:id` | Actualizar producto | Sí |
| DELETE | `/api/productos/:id` | Eliminar producto | Sí |
| GET | `/api/categorias` | Listar categorías | Sí |
| POST | `/api/categorias` | Crear categoría | Sí |
| PUT | `/api/categorias/:id` | Actualizar categoría | Sí |
| DELETE | `/api/categorias/:id` | Eliminar categoría | Sí |
| GET | `/api/movimientos` | Listar movimientos | Sí |
| POST | `/api/movimientos` | Registrar movimiento | Sí |
| GET | `/api/alertas` | Alertas de stock bajo | Sí |
| POST | `/api/ventas` | Realizar venta | Sí |
| GET | `/api/ventas/productos` | Productos para clientes | No |
| GET | `/api/ventas/mis-pedidos` | Pedidos del cliente | Sí |
| GET | `/api/reportes` | Reportes y estadísticas | Sí |

### Middlewares

- **authMiddleware.js** — Verifica token JWT en rutas protegidas
- **uploadMiddleware.js** — Maneja subida de imágenes con Multer
- **validateMiddleware.js** — Validación de datos de entrada

### Controladores

| Archivo | Descripción |
|---------|-------------|
| `authController.js` | Login, perfil de usuario |
| `productController.js` | CRUD de productos con imágenes |
| `categoryController.js` | CRUD de categorías |
| `movementController.js` | Registro de movimientos de inventario |
| `alertController.js` | Alertas de stock mínimo |
| `ventaController.js` | Ventas, carrito y pedidos |
| `reportController.js` | Reportes y estadísticas |

## Frontend Web

### Tecnologías

- **React 19** con **Vite**
- **TailwindCSS** para estilos
- **Axios** para peticiones HTTP
- **React Router** para navegación
- **SweetAlert2** para notificaciones
- **Recharts** para gráficos
- **Lucide React** para iconos

### Páginas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Login | Inicio de sesión |
| `/dashboard` | Dashboard | Panel principal con estadísticas |
| `/productos` | Products | CRUD de productos |
| `/categorias` | Categories | CRUD de categorías |
| `/movimientos` | Movements | Registro de movimientos |
| `/alertas` | Alerts | Alertas de stock bajo |
| `/reportes` | Reports | Reportes y gráficos |
| `/cliente/catalogo` | ClienteCatalogo | Catálogo para clientes |
| `/cliente/carrito` | ClienteCarrito | Carrito de compras |
| `/cliente/pedidos` | ClientePedidos | Historial de pedidos |

## App Móvil (React Native)

### Tecnologías

- **React Native** con **Expo**
- **Expo Router** para navegación
- **Axios** para peticiones HTTP
- **AsyncStorage** para almacenamiento local
- **Lucide React Native** para iconos
- **Expo Camera / BarCodeScanner** para escáner

### Pantallas

| Pantalla | Descripción |
|----------|-------------|
| LoginScreen | Inicio de sesión |
| DashboardScreen | Panel con resumen |
| ProductsScreen | CRUD de productos |
| CategoriesScreen | CRUD de categorías |
| MovementsScreen | Movimientos de inventario |
| AlertsScreen | Alertas de stock |
| ReportesScreen | Reportes |
| ScannerScreen | Escáner de código de barras |
| ClienteCatalogoScreen | Catálogo de compras |
| ClienteCarritoScreen | Carrito de compras |
| ClientePedidosScreen | Historial de pedidos |

## Base de Datos

### Tablas Principales

- **usuarios** — Administradores y clientes
- **categorias** — Categorías de productos
- **productos** — Productos con stock, precio, imagen
- **movimientos** — Entradas y salidas de inventario
- **ventas** — Registro de ventas
- **detalle_ventas** — Productos vendidos en cada venta

### Diagrama Relacional

```
usuarios 1──N ventas
categorias 1──N productos
productos 1──N movimientos
productos 1──N detalle_ventas
ventas 1──N detalle_ventas
```

## Variables de Entorno

### Backend (`backend/.env`)

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cafeteria_inventory
DB_PORT=3306
JWT_SECRET=clave_secreta
FRONTEND_URL=http://localhost:5173
```

### Frontend Web (`frontend-web/.env`)

```env
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:4000
```

### App Móvil (`mobile-app/services/config.js`)

```js
const API_URL = 'http://192.168.x.x:4000/api';
export const IMAGES_URL = 'http://192.168.x.x:4000';
```
