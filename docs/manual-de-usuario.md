# Manual de Usuario

## Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel Web](#panel-web)
4. [App Móvil](#app-móvil)
5. [Gestión de Productos](#gestión-de-productos)
6. [Gestión de Categorías](#gestión-de-categorías)
7. [Control de Inventario](#control-de-inventario)
8. [Ventas (Módulo Cliente)](#ventas-módulo-cliente)
9. [Reportes](#reportes)

---

## Introducción

**CafeSys** es un sistema multiplataforma para la gestión de inventario de cafeterías. Permite administrar productos, controlar el stock, registrar movimientos, generar reportes y realizar ventas desde una interfaz web y una aplicación móvil.

---

## Acceso al Sistema

### Credenciales por Defecto

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Cliente | `cliente` | `cliente123` |

### Pantalla de Login

1. Ingresa tu usuario y contraseña
2. Presiona **Iniciar Sesión**
3. El sistema redirigirá al panel correspondiente según tu rol

---

## Panel Web

### Dashboard

Al iniciar sesión como administrador verás el panel principal con:

- **Tarjetas de resumen**: Total productos, stock bajo, movimientos del mes
- **Gráfico de productos por categoría** (gráfico de pastel)
- **Gráfico de movimientos mensuales** (gráfico de barras)
- **Alertas recientes** de stock bajo

### Barra de Navegación

Desde el menú lateral puedes acceder a:

- **Dashboard** — Panel principal
- **Productos** — Gestión de productos
- **Categorías** — Gestión de categorías
- **Movimientos** — Registro de entradas/salidas
- **Alertas** — Productos con stock bajo
- **Reportes** — Estadísticas y reportes

---

## App Móvil

### Funcionalidades Disponibles

- **Dashboard** — Resumen del inventario
- **Productos** — CRUD completo
- **Categorías** — Gestión de categorías
- **Movimientos** — Registrar entradas/salidas
- **Alertas** — Notificaciones de stock bajo
- **Escáner** — Leer códigos de barras
- **Reportes** — Estadísticas
- **Catálogo Cliente** — Compras desde el móvil

---

## Gestión de Productos

### Agregar Producto

1. Ve a **Productos** en el menú
2. Presiona **Nuevo Producto**
3. Completa los campos:
   - **Nombre** (obligatorio)
   - **Categoría**
   - **Stock** (obligatorio)
   - **Stock Mínimo**
   - **Precio** (obligatorio)
   - **Fecha de Vencimiento**
   - **Código de Barras**
   - **Imagen** (opcional)
4. Presiona **Crear Producto**

### Editar Producto

1. En la lista de productos, presiona el ícono de lápiz ✏️
2. Modifica los campos necesarios
3. Presiona **Actualizar**

### Eliminar Producto

1. Presiona el ícono de papelera 🗑️
2. Confirma la eliminación

### Buscar Producto

Usa la barra de búsqueda para filtrar por nombre o código de barras.

---

## Gestión de Categorías

### Agregar Categoría

1. Ve a **Categorías**
2. Presiona **Nueva Categoría**
3. Ingresa el nombre
4. Presiona **Crear**

### Editar / Eliminar Categoría

Usa los botones de acción en la lista de categorías.

---

## Control de Inventario

### Registrar Movimiento

1. Ve a **Movimientos**
2. Presiona **Nuevo Movimiento**
3. Selecciona:
   - **Producto**
   - **Tipo**: Entrada o Salida
   - **Cantidad**
   - **Motivo** (opcional)
4. Presiona **Registrar**

### Alertas de Stock

La sección **Alertas** muestra los productos cuyo stock está por debajo del mínimo configurado.

---

## Ventas (Módulo Cliente)

### Realizar una Compra

1. Inicia sesión como `cliente`
2. Ve al **Catálogo** de productos
3. Presiona **Comprar** en los productos deseados
4. Ajusta las cantidades con los botones **+** y **-**
5. Ve al **Carrito**
6. Presiona **Finalizar Pedido**

### Ver Pedidos Anteriores

En la sección **Mis Pedidos** puedes ver el historial de tus compras.

---

## Reportes

### Reportes Disponibles

- **Productos con stock bajo**
- **Movimientos por período**
- **Ventas realizadas**
- **Productos más vendidos**

### Generar Reporte

1. Ve a **Reportes**
2. Selecciona el tipo de reporte
3. Define el rango de fechas (si aplica)
4. El reporte se mostrará en pantalla

---

## Escáner de Código de Barras (Móvil)

1. En la app móvil, ve a la sección **Escáner**
2. Apunta la cámara al código de barras
3. El producto se buscará automáticamente
4. Podrás ver sus detalles y editarlo

---

## Solución de Problemas

### La app móvil no carga datos
1. Verifica que el backend esté corriendo (`npm run dev` en `backend/`)
2. Revisa que la IP en `mobile-app/services/config.js` sea la correcta
3. Asegúrate que el teléfono y la PC estén en la misma red WiFi

### Error de conexión a la base de datos
1. Verifica que MySQL esté corriendo
2. Revisa las credenciales en `backend/.env`
3. Ejecuta los scripts SQL en `database/`

### Las imágenes no se cargan
1. Verifica que la carpeta `backend/public/uploads/` exista
2. Revisa la URL de imágenes en la configuración
