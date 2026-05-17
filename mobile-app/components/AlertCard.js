import { View, Text, StyleSheet } from 'react-native';
function AlertCard({product}){
return(
<View style={styles.card}>
<Text style={styles.title}>{product.nombre}</Text>
<Text>Stock bajo: {product.stock}</Text>
</View>
)
}
const styles = StyleSheet.create({
card:{
backgroundColor:'#FEE2E2',
padding:20,
borderRadius:20,
marginBottom:10
},
title:{
fontSize:20,
fontWeight:'bold'
}
})
export default AlertCard;