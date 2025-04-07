import React, {useState} from 'react';
import { Alert, ScrollView, View, Text, TouchableOpacity, StyleSheet, ImageBackground, TextInput } from 'react-native';
import { useCart } from '../cartcontext';

export default function CartScreen() {
  const { cart, removeFromCart } = useCart();
  const [bundle_name, setbundle] = useState('');
  
  const makebundle = async () => {
    const API_URL = 'http://3.144.100.86:8000/makebundle'
    if (parseFloat(cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2)) <=0) {
      Alert.alert("error", "Cart is empty")
  }
  else {
    const token = localStorage.getItem('token');
    if (!token) {
      Alert.alert("error", "No token found, please log in again");
      return;
    }

    const bundleData = {
      // user_id: "some id", //this WONT WORK
      name: bundle_name,
      total_price: parseFloat(cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2)),
      items: cart.map(item => ({
        item_id: item.id,
        name: item.name,
        price: item.price,

      })),
    };
    try{
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` //token for authentication but unsure if this works or not
      },
      body: JSON.stringify(bundleData),
    });
    if (response.ok) {
      Alert.alert("message", "Bundle has been saved. View in profile!");
    } else {
      Alert.alert("error", "An error occurred");
    }
  } catch (error) {
    console.error('Error creating bundle:', error);
    Alert.alert("error", "An error occurred while making the bundle");
  }
}
};

  const calculateTotal = () => {

    if (parseFloat(cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2)) > 12) {
      console.log("Total price is greater than 12");
      return "error"
      // Alert.alert("error", "Total price is greater than 12. Please remove an item");
    } else {
    return cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/background_blue.png')} style={styles.background}>
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Cart</Text>
        <Text style={styles.totalPrice}>Total Price: ${calculateTotal()}</Text>
      {cart.map((item, index) => (
        <View key={index} style={styles.itemBox}>
          <Text style={styles.itemText}>{item.name} - ${item.price}</Text>
          <TouchableOpacity onPress={() => removeFromCart(item.id)}>
            <Text style={styles.removeButton}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
          <View  style={styles.itemBox}>
            <TextInput style={styles.itemText} placeholder="Save your cart as bundle" value={bundle_name} onChangeText={setbundle} placeholderTextColor="#888" onEndEditing={() => makebundle()}/>
          </View>
          </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  totalPrice: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  removeButton: {
    color: 'red',
    marginTop: 5,
  },
});
