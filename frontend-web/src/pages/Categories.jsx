import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });

    const fetchData = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las categorías' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre || form.nombre.trim().length < 2) {
            Swal.fire({ icon: 'warning', title: 'Validación', text: 'El nombre debe tener al menos 2 caracteres' });
            return;
        }
        try {
            if (editing) {
                await updateCategory(editing.id, form);
                Swal.fire({ icon: 'success', title: 'Actualizada', timer: 1500, showConfirmButton: false });
            } else {
                await createCategory(form);
                Swal.fire({ icon: 'success', title: 'Creada', timer: 1500, showConfirmButton: false });
            }
            setShowForm(false);
            setEditing(null);
            setForm({ nombre: '', descripcion: '' });
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar' });
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Eliminar categoría?',
            text: `Se eliminará "${nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;
        try {
            await deleteCategory(id);
            Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1500, showConfirmButton: false });
            fetchData();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo eliminar' });
        }
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
        setShowForm(true);
    };

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-4xl font-bold'>Categorías</h1>
                    <p className='text-gray-500'>{categories.length} categorías</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setShowForm(true); }}
                    className='bg-[#5D4037] text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#4E342E] transition'>
                    <Plus size={20} /> Nueva Categoría
                </button>
            </div>

            {showForm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div className='bg-white p-8 rounded-3xl shadow-2xl w-[450px] relative'>
                        <button onClick={() => { setShowForm(false); setEditing(null); }}
                            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'>
                            <X size={24} />
                        </button>
                        <h2 className='text-2xl font-bold mb-6'>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='text-sm text-gray-600'>Nombre</label>
                                <input type='text' className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className='text-sm text-gray-600'>Descripción (opcional)</label>
                                <textarea className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                                    value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} />
                            </div>
                            <div className='flex gap-3 pt-2'>
                                <button type='submit' className='flex-1 bg-[#5D4037] text-white p-3 rounded-xl hover:bg-[#4E342E] transition'>
                                    {editing ? 'Actualizar' : 'Crear'}
                                </button>
                                <button type='button' onClick={() => { setShowForm(false); setEditing(null); }}
                                    className='flex-1 bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition'>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {categories.map((cat) => (
                    <div key={cat.id} className='bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <h3 className='text-xl font-bold'>{cat.nombre}</h3>
                                <p className='text-gray-500 text-sm mt-1'>{cat.descripcion || 'Sin descripción'}</p>
                                <p className='text-[#5D4037] font-semibold mt-3'>{cat.total_productos} producto(s)</p>
                            </div>
                            <div className='flex gap-2'>
                                <button onClick={() => openEdit(cat)} className='text-blue-500 hover:text-blue-700' title='Editar'>
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(cat.id, cat.nombre)} className='text-red-500 hover:text-red-700' title='Eliminar'>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}

export default Categories;
