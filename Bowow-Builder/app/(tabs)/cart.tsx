import {StyleSheet, View, Text, StatusBar} from 'react-native';
import React from 'react'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

const Cart = () => {
    return (
        <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style = {styles.textBox}>
              <Text>Cart</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
	textBox: {padding: 20},
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
});

export default Cart;