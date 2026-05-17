import { View, Text, StyleSheet } from 'react-native';
function ProductCard({product}){
return(
<View style={styles.card}>
<Text style={styles.title}>{product.nombre}</Text>
<Text>Stock: {product.stock}</Text>
</View>
)
}
const styles = StyleSheet.create({
card:{
backgroundColor:'#FFF',
padding:20,
borderRadius:20,
marginBottom:10
},
title:{
fontSize:20,
fontWeight:'bold'
}
})
export default ProductCard;
