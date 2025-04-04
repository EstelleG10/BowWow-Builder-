import React from 'react';
import { Redirect, Stack, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/Feather';
import {Text} from 'react-native';

export const unstable_settings = {
  initialRouteName: '(root)',
};

const Layout = () => {
  return (
    <Tabs screenOptions={{headerShown: false}}>
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