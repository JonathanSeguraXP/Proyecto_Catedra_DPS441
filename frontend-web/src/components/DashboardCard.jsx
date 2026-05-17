function DashboardCard({ title, value, icon }) {
    return (
        <div className='bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition'>
            <div className='text-[#5D4037]'>{icon}</div>
            <h2 className='text-3xl font-bold mt-4'>{value}</h2>
            <p className='text-gray-500 mt-1'>{title}</p>
        </div>
    );
}

export default DashboardCard;
