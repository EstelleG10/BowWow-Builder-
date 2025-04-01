import {Text, StyleSheet, View } from 'react-native'; 
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Go to login:</Text>
      <Link href="/login" style={styles.link}>
        Go to Login
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 20,
    color: 'blue',
    fontSize: 33,
  },
});
