import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useCart } from '../cartcontext';


export default function CartScreen() {
  const { cart, removeFromCart } = useCart();

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);
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
