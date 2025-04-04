import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useCart } from '../cartcontext';

type Item = {
  id: number;
  name: string;
  price: number;
};

export default function Category() {
  const [foodItems, setFoodItems] = useState<Item[]>([]);
  const { cart, addToCart } = useCart(); 

  const API_URL = 'http://3.144.100.86:5000/items';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setFoodItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);
  };

  return (
    <ImageBackground source={require('../../assets/images/background_white.jpg')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>Shop</Text>
          <Text style={styles.totalPrice}>Total Price: ${calculateTotal()}</Text>
          <View style={styles.grid}>
            {foodItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.itemBox} onPress={() => addToCart(item)}>
                <View style={styles.imagePlaceholder} />
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemText}>${item.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  container: {
    alignItems: 'center',
    marginTop: 10,
  },
  header: {
    marginTop: 50,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  itemBox: {
    alignItems: 'center',
    margin: 10,
  },
  imagePlaceholder: {
    width: 155,
    height: 155,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});
