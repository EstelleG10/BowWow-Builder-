import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Alert,
} from 'react-native';
import { useCart } from '../cartcontext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Constants from '../../constants';

export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [mealName, setMealName] = useState('');

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price as any), 0);
  };

  const total = calculateTotal();
  const amountLeftOrOver = total > 12 ? (total - 12).toFixed(2) : (12 - total).toFixed(2);
  const isOver = total > 12;

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
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(Constants.IP_ADDRESS + 'api/meals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });

      if (response.ok) {
        Alert.alert('Meal saved!');
        setMealName('');
        clearCart();        
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
      <View style={styles.cartHeaderRow}>
        <Text style={styles.header}>Cart</Text>
        <View style={styles.cartIconWrapper}>
          <Image source={require('../../assets/images/cart_white.png')} style={styles.cartIcon} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </View>
      </View>

        <Text style={styles.totalPrice}>Total Price: ${total.toFixed(2)}</Text>
        <Text style={isOver ? styles.overText : styles.underText}>
          {isOver ? `Amount Over: $${amountLeftOrOver}` : `Amount Left: $${amountLeftOrOver}`}
        </Text>

        {cart.map((item, index) => (
      <View key={index} style={styles.itemBox}>
        <View style={styles.itemTextWrapper}>
          <Text style={styles.itemText}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashWrapper}>
          <Image source={require('../../assets/images/trash.png')} style={styles.trashIcon} />
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

        {cart.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        )}

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
  paddingTop: 20, 
  alignItems: 'center',
},
header: {
  fontSize: 24,
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 0, 
},
  totalPrice: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  underText: {
    color: 'lightgreen',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overText: {
    color: 'salmon',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
itemBox: {
  width: '100%',
  height: 100, 
  backgroundColor: '#eee',
  borderRadius: 10,
  marginBottom: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 15,
},
itemText: {
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
},
itemTextWrapper: {
  flex: 1,
  justifyContent: 'center',
  },
itemPrice: {
  fontSize: 16,
  textAlign: 'center',
  marginTop: 4,
},
  removeButton: {
    color: 'red',
    marginTop: 5,
  },
  clearButton: {
    backgroundColor: '#b00020',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 40, 
    backgroundColor: 'white',
    color: 'black',
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
trashWrapper: {
  paddingLeft: 10,
},

trashIcon: {
  width: 24,
  height: 24,
  },
  cartHeaderRow: {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginTop: 50,
  marginBottom: 10,
},
cartIconWrapper: {
  position: 'relative',
},
cartIcon: {
  width: 40,
  height: 40,
},

cartBadge: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: 'red',
  borderRadius: 10,
  paddingHorizontal: 6,
  paddingVertical: 2,
},

badgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 12,
},

});
