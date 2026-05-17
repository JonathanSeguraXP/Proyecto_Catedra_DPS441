import { LayoutDashboard, Package, AlertTriangle, ClipboardList, BarChart3, Coffee, FileText, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const links = [
        { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
        { to: '/productos', icon: <Package size={22} />, label: 'Productos' },
        { to: '/categorias', icon: <ClipboardList size={22} />, label: 'Categorías' },
        { to: '/movimientos', icon: <BarChart3 size={22} />, label: 'Movimientos' },
        { to: '/alertas', icon: <AlertTriangle size={22} />, label: 'Alertas' },
        { to: '/reportes', icon: <FileText size={22} />, label: 'Reportes' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className='w-[260px] min-h-screen bg-[#3E2723] text-white p-6 flex flex-col'>
            <div className='flex items-center gap-3 mb-10'>
                <Coffee size={40} />
                <h1 className='text-2xl font-bold'>CafeSys</h1>
            </div>
            <nav className='flex flex-col gap-2 flex-1'>
                {links.map((link) => (
                    <Link key={link.to} to={link.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                            location.pathname === link.to
                                ? 'bg-[#5D4037] text-yellow-300 font-semibold'
                                : 'hover:bg-[#4E342E] hover:text-yellow-200'
                        }`}>
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </nav>
            <button onClick={handleLogout}
                className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-800 transition mt-4'>
                <LogOut size={22} />
                Cerrar sesión
            </button>
        </div>
    );
}

export default Sidebar;
