function ProductCard({product}){
return(
<div className='bg-white p-5 rounded-3xl shadow-lg'>
<h2 className='text-2xl font-bold'>
{product.nombre}
</h2>
<p className='text-gray-500 mt-2'>
Stock: {product.stock}
</p>
<p className='text-[#5D4037] font-bold mt-2'>
${product.precio}
</p>
</div>
)
}
export default ProductCard;
