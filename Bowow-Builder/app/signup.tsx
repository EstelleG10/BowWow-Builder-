import React, { useState } from 'react';
import { Linking, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'http://10.74.174.145:9000/signup';
const SignupScreen = () => {
    const [email, setemail] = useState('');
  const [username, setname] = useState('');
  const [password, setpass] = useState('');


  const submit = async () => {
    if (username == '' || password == '' || email == '') {
      Alert.alert('Error', 'Please enter the values');
    } else {
      try {
        const response = await fetch(API_URL, {  method: 'POST',
          headers: { 'Content-Type': 'application/json',},
          body: JSON.stringify({email: email, username: username,password: password,}),});
          console.log("signup ")
        const data = await response.text();

        console.log('Response:', data); 
        if (response.status === 201) {
          Alert.alert('Success', 'User registered successfully!');
          await AsyncStorage.setItem('user', JSON.stringify(data));
          console.log('User Info:', { email, username, password });
      Alert.alert('Success', 'Username and password are entered');
      console.log('Username', username);
      console.log('Password', password);
      console.log('Email: ', email);
      }
    }
    catch (error){
      console.error("Request error:", error); // Log the error from the catch block
      Alert.alert("Error", "An error occurred. Please try again.");
  }
    }
  }
 


  return (
    <ImageBackground source={require('../assets/images/background_white.jpg')
    } style={styles.container}>
      <Text style={styles.log}>Get Started </Text>
      <TextInput style={styles.input} placeholder="email" value={email} onChangeText={setemail} />
      <TextInput style={styles.input} placeholder="username" value={username} onChangeText={setname} />
      <TextInput style={styles.input} placeholder="password" value={password} onChangeText={setpass} secureTextEntry />
      <Text style={styles.button} onPress={submit}>Sign in</Text>
      <Link href='/login'>
        <Text style={styles.signup}>Already have an account? Sign in here</Text>
      </Link>
      </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', padding: 20, marginBottom: 20,},
  log: {marginTop: 60,justifyContent: 'center', textAlign: 'center', alignItems: 'center', fontSize: 30, fontWeight: 'bold', color: '#000080', fontFamily: 'SF Pro', marginBottom: 60
  },
  input: {justifyContent: 'center', textAlign: 'left', alignItems: 'center', height: 46, fontSize: 13, marginBottom: 20, paddingLeft: 10, borderWidth: 1, borderRadius: 15, width: '100%', borderColor: '#BEDCF9', backgroundColor: '#BEDCF9', color: 'grey'
  },
  button: {fontWeight: 'bold', justifyContent: 'center', textAlign: 'center', alignItems: 'center', color: 'white', fontSize: 18, padding: 10, marginTop: 20, borderWidth: 1, borderColor: '#FCA950', borderRadius: 15, width: '100%', height: 50, backgroundColor: '#FCA950'
  },
  forgot: { lineHeight: 14, fontWeight: 'bold', textAlign: 'right', color: '#000080', fontFamily: 'SF Pro', fontSize: 14 }
  ,
  signup:{ marginTop: 30, lineHeight: 24, fontWeight: 'bold', color: 'grey', fontFamily: 'SF Pro', fontSize: 15, marginBottom: 0, textAlign: 'center' }
});


export default SignupScreen;
