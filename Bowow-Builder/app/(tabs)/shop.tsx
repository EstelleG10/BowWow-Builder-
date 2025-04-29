import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  ImageBackground, TextInput, Image
} from 'react-native';
import { useCart } from '../cartcontext';
import * as Constants from '../../constants';

// type for each item
type Item = {
  id: number;
  name: string;
  price: number;
  category?: string;
  img_route?: string;
};

export default function Category() {
  const [foodItems, setFoodItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(''); 
  const [maxPrice, setMaxPrice] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { cart, addToCart } = useCart();
  const API_URL = Constants.IP_ADDRESS + 'items';

  // fetch items from API 
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

  // filter items w state changes
  useEffect(() => {
    filterItems();
  }, [searchTerm, minPrice, maxPrice, selectedCategory, foodItems]);

  const filterItems = () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    const matchesSearch = (item: Item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice = (item: Item) => {
      if (isNaN(min) && isNaN(max)) return true;
      if (!isNaN(min) && item.price < min) return false;
      if (!isNaN(max) && item.price > max) return false;
      return true;
    };

    const matchesCategory = (item: Item) =>
      !selectedCategory || item.category === selectedCategory;

    const results = foodItems.filter(
      item => matchesSearch(item) && matchesPrice(item) && matchesCategory(item)
    );

    setFilteredItems(results);
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + parseFloat(item.price as any), 0).toFixed(2);

  const allCategories = Array.from(
    new Set(foodItems.map(item => item.category).filter(Boolean))
  );

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

          {/* Horizontal category list */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {allCategories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categorySelected,
                ]}
                onPress={() =>
                  setSelectedCategory(prev => (prev === cat ? null : cat))
                }
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Min and Max Price inputs */}
          <View style={styles.priceFilterBox}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min Price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <TextInput
              style={styles.priceInput}
              placeholder="Max Price"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
            <TouchableOpacity style={styles.filterButton} onPress={filterItems}>
              <Text style={styles.buttonText}>Show Me Results</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.totalPrice}>Total Price: ${calculateTotal()}</Text>

          <View style={styles.grid}>
            {filteredItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.itemBox} onPress={() => addToCart(item)}>
                {item.img_route && item.img_route.trim() ? (
                  <Image
                    source={{ uri: Constants.IP_ADDRESS + `${encodeURI(item.img_route.trim())}` }}
                    style={styles.itemImage}
                    onError={() => console.warn(`Could not load image for ${item.name}`)}
                  />
                ) : (
                  <View style={styles.imagePlaceholder} />
                )}
                <Text style={styles.itemText} numberOfLines={2}>{item.name}</Text>
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
    width: 340,  
    height: 40, 
    maxWidth: 500,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 10,
    maxHeight: 40,
  },
  categoryButton: {
    backgroundColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categorySelected: {
    backgroundColor: '#007aff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  priceFilterBox: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginBottom: 15,
  },
  priceInput: {
    width: 120,  
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
  },
  itemImage: {
    width: 155,
    height: 155,
    borderRadius: 10,
    marginBottom: 5,
    resizeMode: 'contain',
  },
});