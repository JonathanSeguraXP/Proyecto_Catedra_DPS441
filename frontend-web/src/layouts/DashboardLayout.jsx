import Sidebar from '../components/Sidebar';
14
function DashboardLayout({children}){
return(
<div className='flex'>
<Sidebar />
<div className='flex-1 p-8'>
{children}
</div>
</div>
)
}
export default DashboardLayout;