import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';
import AlertCard from '../components/AlertCard';
import { getAlerts } from '../services/alertService';
import { AlertTriangle, CheckCircle } from 'lucide-react';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAlerts()
            .then(({ data }) => setAlerts(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className='flex items-center gap-3 mb-2'>
                <AlertTriangle size={32} className='text-red-500' />
                <h1 className='text-4xl font-bold'>Alertas de Stock</h1>
            </div>
            <p className='text-gray-500 mb-8'>
                {alerts.length > 0
                    ? `${alerts.length} producto(s) con stock bajo`
                    : 'Todos los productos tienen stock suficiente'}
            </p>

            {alerts.length === 0 ? (
                <div className='bg-green-50 border-2 border-green-200 rounded-3xl p-12 text-center'>
                    <CheckCircle size={60} className='text-green-500 mx-auto mb-4' />
                    <h2 className='text-2xl font-bold text-green-700'>Sin alertas</h2>
                    <p className='text-green-600'>Todos los productos están por encima de su stock mínimo</p>
                </div>
            ) : (
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {alerts.map((product) => (
                        <AlertCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default Alerts;
