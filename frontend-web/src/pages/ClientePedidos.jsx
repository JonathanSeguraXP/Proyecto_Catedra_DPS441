import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

function ClientePedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/ventas')
            .then(({ data }) => setPedidos(data))
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los pedidos' }))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className='min-h-screen bg-gray-50'>
            <header className='bg-[#3E2723] text-white p-4 flex items-center gap-4'>
                <button onClick={() => navigate('/cliente/catalogo')} className='hover:text-yellow-300 transition'>
                    <ArrowLeft size={24} />
                </button>
                <Package size={24} />
                <h1 className='text-xl font-bold'>Mis pedidos</h1>
            </header>

            <div className='max-w-2xl mx-auto p-4'>
                {loading ? (
                    <div className='text-center py-20 text-gray-500'>Cargando pedidos...</div>
                ) : pedidos.length === 0 ? (
                    <div className='text-center py-20'>
                        <Package size={64} className='mx-auto text-gray-300 mb-4' />
                        <p className='text-gray-500 mb-4'>No tienes pedidos aún</p>
                        <button onClick={() => navigate('/cliente/catalogo')}
                            className='bg-[#5D4037] text-white px-6 py-3 rounded-xl hover:bg-[#4E342E] transition'>
                            Ir a comprar
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {pedidos.map(p => {
                            const items = typeof p.items === 'string' ? JSON.parse(p.items) : p.items;
                            const isExpanded = expanded === p.id;
                            return (
                                <div key={p.id} className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                                    <button onClick={() => setExpanded(isExpanded ? null : p.id)}
                                        className='w-full p-4 flex items-center justify-between hover:bg-gray-50 transition'>
                                        <div className='text-left'>
                                            <div className='flex items-center gap-3'>
                                                <span className='font-bold'>Pedido #{p.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {p.estado === 'completada' ? 'Completado' : p.estado}
                                                </span>
                                            </div>
                                            <p className='text-sm text-gray-500 mt-1'>
                                                {new Date(p.created_at).toLocaleDateString()} - <span className='font-bold text-[#5D4037]'>${Number(p.total).toFixed(2)}</span>
                                            </p>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className='text-gray-400' /> : <ChevronDown size={20} className='text-gray-400' />}
                                    </button>
                                    {isExpanded && items && (
                                        <div className='px-4 pb-4 border-t'>
                                            {items.map((item, i) => (
                                                <div key={i} className='flex items-center justify-between py-2 text-sm'>
                                                    <span>{item.producto} <span className='text-gray-400'>x{item.cantidad}</span></span>
                                                    <span className='font-medium'>${Number(item.subtotal).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientePedidos;
