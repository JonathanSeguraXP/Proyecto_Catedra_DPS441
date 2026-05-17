import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

function ClienteCarrito() {
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
    const [checking, setChecking] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const updateCantidad = (producto_id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.producto_id !== producto_id) return item;
            const nueva = item.cantidad + delta;
            if (nueva <= 0) return null;
            return { ...item, cantidad: Math.min(nueva, item.stock) };
        }).filter(Boolean));
    };

    const removeItem = (producto_id) => {
        setCart(prev => prev.filter(item => item.producto_id !== producto_id));
    };

    const hasOutOfStock = cart.some(item => item.stock === 0);
    const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    const checkout = async () => {
        if (!cart.length) return;
        setChecking(true);
        try {
            const items = cart.map(({ producto_id, cantidad }) => ({ producto_id, cantidad }));
            const { data } = await api.post('/ventas', { items });
            localStorage.removeItem('cart');
            setCart([]);
            Swal.fire({ icon: 'success', title: '¡Compra realizada!', text: `Venta #${data.venta_id} - Total: $${data.total.toFixed(2)}` });
            navigate('/cliente/pedidos');
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al procesar la compra' });
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <header className='bg-[#3E2723] text-white p-4 flex items-center gap-4'>
                <button onClick={() => navigate('/cliente/catalogo')} className='hover:text-yellow-300 transition'>
                    <ArrowLeft size={24} />
                </button>
                <ShoppingCart size={24} />
                <h1 className='text-xl font-bold'>Carrito</h1>
                <span className='text-sm opacity-80 ml-auto'>{cart.length} producto{cart.length !== 1 ? 's' : ''}</span>
            </header>

            <div className='max-w-2xl mx-auto p-4'>
                {cart.length === 0 ? (
                    <div className='text-center py-20'>
                        <ShoppingCart size={64} className='mx-auto text-gray-300 mb-4' />
                        <p className='text-gray-500 mb-4'>Carrito vacío</p>
                        <button onClick={() => navigate('/cliente/catalogo')}
                            className='bg-[#5D4037] text-white px-6 py-3 rounded-xl hover:bg-[#4E342E] transition'>
                            Ver productos
                        </button>
                    </div>
                ) : (
                    <>
                        <div className='space-y-3 mb-6'>
                            {cart.map(item => (
                                <div key={item.producto_id} className='bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <h3 className='font-bold'>{item.nombre}</h3>
                                        <p className='text-sm text-gray-500'>${Number(item.precio).toFixed(2)} c/u</p>
                                        {item.stock === 0 && (
                                            <p className='text-xs font-bold text-red-600 mt-1'>AGOTADO - No disponible</p>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex items-center gap-2 border rounded-xl px-3 py-1'>
                                            <button onClick={() => updateCantidad(item.producto_id, -1)}
                                                className='w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-sm font-bold'>-</button>
                                            <span className='font-bold w-6 text-center'>{item.cantidad}</span>
                                            <button onClick={() => updateCantidad(item.producto_id, 1)}
                                                className='w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-sm font-bold'>+</button>
                                        </div>
                                        <p className='font-bold w-20 text-right'>${(item.precio * item.cantidad).toFixed(2)}</p>
                                        <button onClick={() => removeItem(item.producto_id)}
                                            className='text-red-400 hover:text-red-600 transition p-1'>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='bg-white rounded-2xl shadow-md p-6'>
                            {hasOutOfStock && (
                                <p className='text-sm text-red-600 font-bold mb-3 text-center'>Eliminá los productos agotados para continuar</p>
                            )}
                            <div className='flex justify-between items-center mb-4'>
                                <span className='text-lg font-bold'>Total</span>
                                <span className='text-2xl font-bold text-[#5D4037]'>${total.toFixed(2)}</span>
                            </div>
                            <button onClick={checkout} disabled={checking || hasOutOfStock}
                                className='w-full bg-[#5D4037] text-white p-4 rounded-xl hover:bg-[#4E342E] transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg font-bold'>
                                <CreditCard size={22} />
                                {checking ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ClienteCarrito;
