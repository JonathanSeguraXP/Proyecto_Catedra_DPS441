import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/authService';
import Swal from 'sweetalert2';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos' });
            return;
        }
        setLoading(true);
        try {
            const { data } = await login(form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.user.rol === 'cliente') {
                navigate('/cliente/catalogo');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al iniciar sesión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#3E2723] flex items-center justify-center'>
            <div className='bg-white p-10 rounded-3xl shadow-2xl w-[400px]'>
                <div className='flex justify-center mb-6'><Coffee size={60} className='text-[#5D4037]' /></div>
                <h1 className='text-3xl font-bold text-center mb-2'>CafeSys</h1>
                <p className='text-gray-500 text-center mb-8'>Control de inventario</p>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='text-sm text-gray-600 font-medium'>Correo electrónico</label>
                        <input type='email' placeholder='admin@cafesys.com'
                            className='w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-[#5D4037] outline-none'
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className='relative'>
                        <label className='text-sm text-gray-600 font-medium'>Contraseña</label>
                        <input type={showPassword ? 'text' : 'password'} placeholder='••••••'
                            className='w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-[#5D4037] outline-none pr-10'
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <button type='button' onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-[42px] text-gray-400'>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button disabled={loading}
                        className='w-full bg-[#5D4037] text-white p-3 rounded-xl hover:bg-[#4E342E] transition disabled:opacity-50'>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
                <p className='text-xs text-gray-400 text-center mt-6'>Demo: admin@cafesys.com / admin123</p>
            </div>
        </div>
    );
}

export default Login;
