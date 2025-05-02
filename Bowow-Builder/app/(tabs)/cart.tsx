import React, { useState, useRef } from "react";
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
  Animated,
} from "react-native";
import { useCart } from "../cartcontext";
import GlobalStyles from "../../styles/GlobalStyleSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Constants from "../../constants";

export default function CartScreen() {
  const [showToast, setShowToast] = useState(false);
  const toastY = useRef(new Animated.Value(100)).current;

  const triggerToast = () => {
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(toastY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowToast(false));
  };

  const { cart, removeFromCart, clearCart } = useCart();
  const [mealName, setMealName] = useState("");

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.price as any),
      0
    );
  };

  const total = calculateTotal();
  const amountLeftOrOver =
    total > 12 ? (total - 12).toFixed(2) : (12 - total).toFixed(2);
  const isOver = total > 12;

  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert("Please enter a meal name!");
      return;
    }

    const mealData = {
      name: mealName,
      items: cart.map((item) => item.id),
    };

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(Constants.IP_ADDRESS + "api/meals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });

      if (response.ok) {
        triggerToast();
        setMealName("");
        clearCart();
      } else {
        Alert.alert("Error saving meal.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network error!");
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/dark_blue.jpg')}
      style={styles.background}
    >
      <View style={styles.scrollWrapper}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cartHeaderRow}>
            <Text style={[GlobalStyles.title, { marginTop: 10 }]}>Cart</Text>
            <View style={styles.cartIconWrapper}>
              <Image
                source={require("../../assets/images/cart_white.png")}
                style={styles.cartIcon}
              />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cart.length}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.totalPrice}>Total Price: ${total.toFixed(2)}</Text>
          <Text style={isOver ? styles.overText : styles.underText}>
            {isOver
              ? `Amount Over: $${amountLeftOrOver}`
              : `Amount Left: $${amountLeftOrOver}`}
          </Text>

          {cart.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <View style={styles.itemTextWrapper}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemText}>
                  ${parseFloat(item.price as any).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                style={styles.trashWrapper}
              >
                <Image
                  source={require('../../assets/images/trash.png')}
                  style={styles.trashIcon}
                />
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

          <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={handleSaveMeal}>
            <Text style={styles.buttonText}>Save and Post Meal!!</Text>
          </TouchableOpacity>

          {cart.length > 0 && (
            <TouchableOpacity style={[styles.button, styles.redButton]} onPress={clearCart}>
              <Text style={styles.buttonText}>Clear Cart</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {showToast && (
          <Animated.View
            style={[styles.toast, { transform: [{ translateY: toastY }] }]}
          >
            <Text style={styles.toastText}>Added to Cart!</Text>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollWrapper: {
    flex: 1,
    width: "100%",
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
  },
  totalPrice: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  underText: {
    color: "lightgreen",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  overText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  itemBox: {
    width: "100%",
    height: 100,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  itemTextWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "white",
    color: "black",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  greenButton: {
    backgroundColor: "#063E68",
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  redButton: {
    backgroundColor: "#1a88db",
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 3,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  trashWrapper: {
    paddingLeft: 10,
  },
  trashIcon: {
    width: 24,
    height: 24,
  },
  cartHeaderRow: {
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: 40,
    marginBottom: 10,
  },
  cartIconWrapper: {
    position: "absolute",
    right: 2,
    top: -10,
  },
  cartIcon: {
    width: 40,
    height: 40,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  toast: {
    position: 'absolute',
    width: 150,
    height: 50,
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    zIndex: 20,
  },
  toastText: {
    color: '#1c37b0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
