import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/Feather';

const Layout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ 
        title: 'Home', 
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />
        }} />
      <Tabs.Screen name="shop" options={{ 
        title: 'Food',
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="shopping-bag" color={color} />
         }} />
      <Tabs.Screen name="cart" options={{ 
        title: 'Cart',
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="shopping-cart" color={color} />
      }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Setting',
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="settings" color={color} />
      }} />
    </Tabs>
  )
}

export default Layout;