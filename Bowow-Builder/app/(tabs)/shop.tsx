import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ImageBackground, TextInput
} from 'react-native';
import { useCart } from '../cartcontext';

type Item = {
  id: number;
  name: string;
  price: number;
};

export default function Category() {
  const [foodItems, setFoodItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const { cart, addToCart } = useCart();

  const API_URL = 'http://3.144.100.86:8000/items';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setFoodItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  // let users search for items ALSO let users search for a price so they can comlete order under 12
  useEffect(() => {
    filterItems();
  }, [searchTerm, targetPrice, priceRange, foodItems]);

  const filterItems = () => {
    const price = parseFloat(targetPrice);
    const range = parseFloat(priceRange);

    const matchesSearch = (item: Item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = (item: Item) => {
      if (isNaN(price) || isNaN(range)) return true;
      return item.price >= price - range && item.price <= price + range;
    };

    const results = foodItems.filter(item => matchesSearch(item) && matchesPrice(item));
    setFilteredItems(results);
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);

  return (
    <ImageBackground source={require('../../assets/images/background_white.jpg')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>Shop</Text>

          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search items..."
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={text => setSearchTerm(text)}
            />
          </View>

          <View style={styles.priceFilterBox}>
            <TextInput
              style={styles.priceInput}
              placeholder="Target price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={text => setTargetPrice(text)}
            />
            <TextInput
              style={styles.priceInput}
              placeholder="Range"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={priceRange}
              onChangeText={text => setPriceRange(text)}
            />
            <TouchableOpacity style={styles.filterButton} onPress={filterItems}>
              <Text style={styles.buttonText}>Show Me Results</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.totalPrice}>Total Price: ${calculateTotal()}</Text>

          <View style={styles.grid}>
            {filteredItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.itemBox} onPress={() => addToCart(item)}>
                <View style={styles.imagePlaceholder} />
                <Text style={styles.itemText} numberOfLines={2}>
                  {item.name}
                </Text>
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
  searchWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: {
    width: '95%',
    maxWidth: 500,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16,
  },
  priceFilterBox: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginBottom: 15,
  },
  priceInput: {
    width: '95%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    width: 150,
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
    width: '100%',
  },
});
