import { AlertTriangle, Package } from 'lucide-react';

function AlertCard({ product }) {
    return (
        <div className='bg-red-50 border border-red-200 p-5 rounded-2xl hover:shadow-lg transition'>
            <div className='flex items-center gap-3 mb-2'>
                <AlertTriangle size={24} className='text-red-500' />
                <h2 className='font-bold text-xl'>{product.nombre}</h2>
            </div>
            <div className='flex items-center gap-2 text-red-700'>
                <Package size={18} />
                <p className='font-semibold'>
                    Stock: <span className='text-2xl'>{product.stock}</span>
                    <span className='text-sm font-normal text-red-400'> / mín: {product.stock_minimo}</span>
                </p>
            </div>
            {product.categoria && (
                <p className='text-sm text-red-400 mt-1'>Categoría: {product.categoria}</p>
            )}
        </div>
    );
}

export default AlertCard;
