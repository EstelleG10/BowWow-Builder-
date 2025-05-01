import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Image } from 'react-native';

type Item = {
  id: number;
  name: string;
  price: number;
};

type CartContextType = {
  cart: Item[];
  addToCart: (item: Item) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Item[]>([]);

  const addToCart = (item: Item) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (id: number) => {
    let removed = false;
    setCart(prev =>
      prev.filter(item => {
        if (!removed && item.id === id) {
          removed = true;
          return false;
        }
        return true;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
