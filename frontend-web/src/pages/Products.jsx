import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import ProductForm from '../components/ProductForm';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { Plus, Pencil, Trash2, X, Search, Image } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            const [pRes, cRes] = await Promise.all([getProducts(), getCategories()]);
            setProducts(pRes.data);
            setCategories(cRes.data);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: 'Eliminar producto?',
            text: `Se eliminará "${nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;
        try {
            await deleteProduct(id);
            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Producto eliminado', timer: 1500, showConfirmButton: false });
            fetchData();
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
        }
    };

    const handleSubmit = async (formData, id) => {
        try {
            if (editing) {
                await updateProduct(id || editing.id, formData);
                Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
            } else {
                await createProduct(formData);
                Swal.fire({ icon: 'success', title: 'Creado', timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            setEditing(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Error al guardar';
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
        }
    };

    const openEdit = (product) => {
        setEditing(product);
        setShowForm(true);
    };

    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };

    const filtered = products.filter((p) =>
        p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo_barras?.includes(search)
    );

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-4xl font-bold'>Productos</h1>
                    <p className='text-gray-500'>{products.length} productos registrados</p>
                </div>
                <button onClick={openCreate} className='bg-[#5D4037] text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#4E342E] transition'>
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            <div className='relative mb-6'>
                <Search size={20} className='absolute left-4 top-3.5 text-gray-400' />
                <input type='text' placeholder='Buscar producto...'
                    className='w-full border p-3 pl-12 rounded-xl focus:ring-2 focus:ring-[#5D4037] outline-none'
                    value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {showForm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-white p-8 rounded-3xl shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto relative'>
                        <button onClick={() => { setShowForm(false); setEditing(null); }}
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'>
                            <X size={24} />
                        </button>
                        <h2 className='text-2xl font-bold mb-6'>{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <ProductForm
                            categories={categories}
                            initial={editing}
                            onSubmit={handleSubmit}
                            onCancel={() => { setShowForm(false); setEditing(null); }}
                        />
                    </div>
                </div>
            )}

            <div className='overflow-auto bg-white rounded-3xl shadow-xl'>
                <table className='w-full'>
                    <thead className='bg-[#5D4037] text-white'>
                        <tr>
                            <th className='p-4 text-center w-16'>Imagen</th>
                            <th className='p-4 text-left'>Nombre</th>
                            <th className='p-4 text-left'>Categoría</th>
                            <th className='p-4 text-center'>Stock</th>
                            <th className='p-4 text-center'>Stock Mín.</th>
                            <th className='p-4 text-right'>Precio</th>
                            <th className='p-4 text-center'>Código</th>
                            <th className='p-4 text-center'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className='p-8 text-center text-gray-400'>No hay productos</td></tr>
                        ) : (
                            filtered.map((product) => (
                                <tr key={product.id} className='border-b hover:bg-gray-50 transition'>
                                    <td className='p-2 text-center'>
                                        {product.imagen ? (
                                            <img src={`${API_URL}/uploads/${product.imagen}`} alt={product.nombre}
                                                className='w-10 h-10 rounded-lg object-cover mx-auto' />
                                        ) : (
                                            <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto'>
                                                <Image size={16} className='text-gray-400' />
                                            </div>
                                        )}
                                    </td>
                                    <td className='p-4 font-medium'>{product.nombre}</td>
                                    <td className='p-4'>{product.categoria || '---'}</td>
                                    <td className='p-4 text-center'>
                                        {product.stock === 0 ? (
                                            <span className='inline-block bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold'>AGOTADO</span>
                                        ) : (
                                            <span className={`font-bold ${product.stock <= product.stock_minimo ? 'text-red-500' : 'text-green-600'}`}>
                                                {product.stock}
                                            </span>
                                        )}
                                    </td>
                                    <td className='p-4 text-center'>{product.stock_minimo}</td>
                                    <td className='p-4 text-right font-bold'>${Number(product.precio).toFixed(2)}</td>
                                    <td className='p-4 text-center text-sm font-mono'>{product.codigo_barras || '---'}</td>
                                    <td className='p-4 text-center'>
                                        <button onClick={() => openEdit(product)} className='text-blue-500 hover:text-blue-700 mr-3' title='Editar'>
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(product.id, product.nombre)} className='text-red-500 hover:text-red-700' title='Eliminar'>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}

export default Products;
