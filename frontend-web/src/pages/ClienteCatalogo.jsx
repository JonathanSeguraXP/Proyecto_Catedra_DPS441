import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ShoppingCart, Plus, Minus, Search, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

function ClienteCatalogo() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/ventas/productos')
            .then(({ data }) => setProductos(data))
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los productos' }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (producto) => {
        setCart(prev => {
            const existing = prev.find(item => item.producto_id === producto.id);
            if (existing) {
                return prev.map(item =>
                    item.producto_id === producto.id
                        ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
                        : item
                );
            }
            return [...prev, { producto_id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, stock: producto.stock }];
        });
    };

    const removeFromCart = (producto_id) => {
        setCart(prev => {
            const existing = prev.find(item => item.producto_id === producto_id);
            if (existing && existing.cantidad > 1) {
                return prev.map(item =>
                    item.producto_id === producto_id
                        ? { ...item, cantidad: item.cantidad - 1 }
                        : item
                );
            }
            return prev.filter(item => item.producto_id !== producto_id);
        });
    };

    const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className='min-h-screen bg-gray-50'>
            <header className='bg-[#3E2723] text-white p-4 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <Coffee size={32} />
                    <h1 className='text-xl font-bold'>CafeSys</h1>
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-sm opacity-80'>{user.nombre}</span>
                    <button onClick={() => navigate('/cliente/carrito')} className='relative p-2 hover:bg-[#5D4037] rounded-xl transition'>
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className='absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); }}
                        className='text-sm hover:text-yellow-300 transition'>
                        Salir
                    </button>
                </div>
            </header>

            <div className='max-w-4xl mx-auto p-4'>
                <div className='flex items-center gap-4 mb-6 mt-2'>
                    <div className='relative flex-1'>
                        <Search size={20} className='absolute left-3 top-3 text-gray-400' />
                        <input type='text' placeholder='Buscar productos...'
                            className='w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none'
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button onClick={() => navigate('/cliente/pedidos')}
                        className='bg-white border border-[#5D4037] text-[#5D4037] px-4 py-3 rounded-xl hover:bg-gray-50 transition text-sm font-medium'>
                        Mis pedidos
                    </button>
                </div>

                {loading ? (
                    <div className='text-center py-20 text-gray-500'>Cargando productos...</div>
                ) : filtered.length === 0 ? (
                    <div className='text-center py-20 text-gray-500'>No hay productos disponibles</div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {filtered.map(p => {
                            const inCart = cart.find(item => item.producto_id === p.id);
                            return (
                                <div key={p.id} className='bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition'>
                                    {p.imagen && (
                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${p.imagen}`} alt={p.nombre}
                                            className='w-full h-32 object-cover rounded-xl mb-3' />
                                    )}
                                    <div className='flex items-start justify-between mb-3'>
                                        <div>
                                            <h3 className='font-bold text-lg'>{p.nombre}</h3>
                                            <p className='text-sm text-gray-500'>{p.categoria}</p>
                                        </div>
                                        <span className='text-lg font-bold text-[#5D4037]'>${Number(p.precio).toFixed(2)}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        {p.stock === 0 ? (
                                            <span className='text-sm font-bold text-red-600'>AGOTADO</span>
                                        ) : (
                                            <span className={`text-sm ${p.stock <= p.stock_minimo ? 'text-red-500' : 'text-gray-500'}`}>
                                                {p.stock} disp.
                                            </span>
                                        )}
                                        <div className='flex items-center gap-2'>
                                            {inCart && p.stock > 0 && (
                                                <>
                                                    <button onClick={() => removeFromCart(p.id)}
                                                        className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition'>
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className='font-bold w-6 text-center'>{inCart.cantidad}</span>
                                                </>
                                            )}
                                            <button onClick={() => p.stock > 0 && addToCart(p)}
                                                disabled={p.stock === 0}
                                                className={`px-4 py-2 rounded-xl flex items-center gap-1 text-sm transition ${p.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#5D4037] text-white hover:bg-[#4E342E]'}`}>
                                                <Plus size={16} /> {p.stock === 0 ? 'Agotado' : inCart ? 'Agregar' : 'Comprar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClienteCatalogo;
