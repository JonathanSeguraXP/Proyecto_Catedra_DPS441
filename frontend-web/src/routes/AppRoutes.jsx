import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Movements from '../pages/Movements';
import Alerts from '../pages/Alerts';
import Reports from '../pages/Reports';
import ClienteCatalogo from '../pages/ClienteCatalogo';
import ClienteCarrito from '../pages/ClienteCarrito';
import ClientePedidos from '../pages/ClientePedidos';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to='/' replace />;
    return children;
}

function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path='/productos' element={<ProtectedRoute><Products /></ProtectedRoute>} />
                    <Route path='/categorias' element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                    <Route path='/movimientos' element={<ProtectedRoute><Movements /></ProtectedRoute>} />
                    <Route path='/alertas' element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                    <Route path='/reportes' element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    <Route path='/cliente/catalogo' element={<ProtectedRoute><ClienteCatalogo /></ProtectedRoute>} />
                    <Route path='/cliente/carrito' element={<ProtectedRoute><ClienteCarrito /></ProtectedRoute>} />
                    <Route path='/cliente/pedidos' element={<ProtectedRoute><ClientePedidos /></ProtectedRoute>} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default AppRoutes;
