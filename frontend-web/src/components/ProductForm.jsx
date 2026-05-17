import { useState, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';

function ProductForm({ categories = [], initial = null, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        nombre: '',
        categoria_id: '',
        stock: '',
        stock_minimo: '',
        precio: '',
        fecha_vencimiento: '',
        codigo_barras: ''
    });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (initial) {
            setForm({
                nombre: initial.nombre || '',
                categoria_id: initial.categoria_id || '',
                stock: initial.stock ?? '',
                stock_minimo: initial.stock_minimo ?? '',
                precio: initial.precio ?? '',
                fecha_vencimiento: initial.fecha_vencimiento ? initial.fecha_vencimiento.split('T')[0] : '',
                codigo_barras: initial.codigo_barras || ''
            });
            if (initial.imagen) {
                setPreview(`${import.meta.env.VITE_BACKEND_URL}/uploads/${initial.imagen}`);
            }
        }
    }, [initial]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', form.nombre);
        if (form.categoria_id) data.append('categoria_id', form.categoria_id);
        data.append('stock', Number(form.stock));
        data.append('stock_minimo', Number(form.stock_minimo));
        data.append('precio', Number(form.precio));
        if (form.fecha_vencimiento) data.append('fecha_vencimiento', form.fecha_vencimiento);
        if (form.codigo_barras) data.append('codigo_barras', form.codigo_barras);
        if (imagen) data.append('imagen', imagen);
        onSubmit(data, initial?.id);
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Imagen */}
            <div>
                <label className='text-sm text-gray-600'>Imagen</label>
                <div className='flex items-center gap-4 mt-1'>
                    {preview ? (
                        <img src={preview} alt='Preview' className='w-20 h-20 rounded-xl object-cover border' />
                    ) : (
                        <div className='w-20 h-20 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400'>
                            <Image size={24} />
                        </div>
                    )}
                    <label className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition'>
                        <Upload size={18} />
                        <span className='text-sm'>{imagen ? 'Cambiar imagen' : 'Subir imagen'}</span>
                        <input type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                    </label>
                </div>
            </div>

            <div>
                <label className='text-sm text-gray-600'>Nombre *</label>
                <input type='text' required
                    className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
                <label className='text-sm text-gray-600'>Categoría</label>
                <select className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                    value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value=''>Sin categoría</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                </select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm text-gray-600'>Stock *</label>
                    <input type='number' min='0' required
                        className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                        value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                    <label className='text-sm text-gray-600'>Stock Mínimo</label>
                    <input type='number' min='0'
                        className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                        value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} />
                </div>
            </div>
            <div>
                <label className='text-sm text-gray-600'>Precio *</label>
                <input type='number' step='0.01' min='0' required
                    className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                    value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm text-gray-600'>Fecha de vencimiento</label>
                    <input type='date'
                        className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                        value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
                </div>
                <div>
                    <label className='text-sm text-gray-600'>Código de barras</label>
                    <input type='text'
                        className='w-full border p-3 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#5D4037]'
                        value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} />
                </div>
            </div>
            <div className='flex gap-3 pt-4'>
                <button type='submit'
                    className='flex-1 bg-[#5D4037] text-white p-3 rounded-xl hover:bg-[#4E342E] transition'>
                    {initial ? 'Actualizar' : 'Crear Producto'}
                </button>
                {onCancel && (
                    <button type='button' onClick={onCancel}
                        className='flex-1 bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition'>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}

export default ProductForm;
