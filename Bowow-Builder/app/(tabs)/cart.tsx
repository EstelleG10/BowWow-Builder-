import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native';
import { useCart } from '../cartcontext';

export default function CartScreen() {
  const { cart, removeFromCart } = useCart();
  const [mealName, setMealName] = useState('');

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);
  };

  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Please enter a meal name!');
      return;
    }

    const mealData = {
      name: mealName,
      items: cart.map(item => item.id),
    };

    try {
      const response = await fetch('http://172.27.58.215:9000/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData),
      });

      if (response.ok) {
        Alert.alert('Meal saved!');
        setMealName('');
      } else {
        Alert.alert('Error saving meal.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network error!');
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

        <TextInput
          style={styles.input}
          placeholder="Name your meal..."
          placeholderTextColor="gray"
          value={mealName}
          onChangeText={setMealName}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
          <Text style={styles.saveButtonText}>Save and Post Meal!!</Text>
        </TouchableOpacity>
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
  input: {
    backgroundColor: 'white',
    color: 'black',
    width: '100%',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});