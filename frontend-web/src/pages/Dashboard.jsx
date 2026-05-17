import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardCard from '../components/DashboardCard';
import Loader from '../components/Loader';
import { getSummary } from '../services/alertService';
import { Package, AlertTriangle, Coffee, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSummary()
            .then(({ data }) => setData(data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

    return (
        <DashboardLayout>
            <h1 className='text-4xl font-bold mb-2'>Dashboard</h1>
            <p className='text-gray-500 mb-10'>Resumen del inventario</p>
            <div className='grid md:grid-cols-3 gap-6'>
                <DashboardCard title='Productos' value={data?.total_productos ?? '---'} icon={<Package size={40} />} />
                <DashboardCard title='Alertas de Stock' value={data?.alertas_stock ?? '---'} icon={<AlertTriangle size={40} />} />
                <DashboardCard title='Categorías' value={data?.total_categorias ?? '---'} icon={<Coffee size={40} />} />
                <DashboardCard title='Mov. Recientes (7d)' value={data?.movimientos_recientes ?? '---'} icon={<TrendingUp size={40} />} />
                <DashboardCard title='Stock Total' value={data?.stock_total ?? '---'} icon={<ShoppingCart size={40} />} />
                <DashboardCard title='Valor Inventario' value={`$${Number(data?.valor_inventario ?? 0).toFixed(2)}`} icon={<DollarSign size={40} />} />
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;
