import { TouchableOpacity, Text, StyleSheet } from 'react-native';
function CustomButton({title,onPress}){
return(
<TouchableOpacity
style={styles.button}
onPress={onPress}
>
<Text style={styles.text}>{title}</Text>
</TouchableOpacity>
)
}
const styles = StyleSheet.create({
button:{
backgroundColor:'#5D4037',
padding:15,
borderRadius:15,
marginVertical:10
},
text:{
color:'#FFF',
textAlign:'center',
fontWeight:'bold'
}
})
export default CustomButton;