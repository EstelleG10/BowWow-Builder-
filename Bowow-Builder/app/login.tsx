import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const router = useRouter();
  const [username, setname] = useState('');
  const [password, setpass] = useState('');

  const submit = async () => {
    if (username === '' || password === '') {
      Alert.alert('Error', 'Please enter a username and password!');
    } else {
      Alert.alert('Success', 'Username and password match!');
      console.log('Username', username);
      console.log('Password', password);
      router.replace('/(tabs)');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background_white.jpg')}
      style={styles.container}
    >
      <Text style={styles.log}>Login here</Text>
      <Text style={styles.subText}>Welcome back you've</Text>
      <Text style={styles.subText}>been missed!</Text>

      <TextInput
        style={styles.input}
        placeholder="username"
        placeholderTextColor="#000080"
        value={username}
        onChangeText={setname}
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        placeholderTextColor="#000080"
        value={password}
        onChangeText={setpass}
        secureTextEntry
      />

      <Link href="/forgotpass">
        <Text style={styles.forgot}>Forgot your password?</Text>
      </Link>

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Link href="/signup">
        <Text style={styles.signup}>Don't have an account? Register Now</Text>
      </Link>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  log: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000080',
    marginBottom: 10,
    fontFamily: 'SF Pro',
  },
  subText: {
    lineHeight: 24,
    fontWeight: 'bold',
    color: 'black',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'SF Pro',
  },
  input: {
    height: 46,
    fontSize: 13,
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 20,
    width: '100%',
    borderColor: '#BEDCF9',
    backgroundColor: '#BEDCF9',
    color: 'grey',
  },
  forgot: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000080',
    textAlign: 'right',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FCA950',
    padding: 14,
    borderRadius: 15,
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signup: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'grey',
    textAlign: 'center',
  },
});

export default LoginScreen;
