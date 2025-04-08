import React, { useState } from "react";
import {
  Linking,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Link } from "expo-router";
import GlobalStyles from "../styles/GlobalStyleSheet";
import { SafeAreaProvider } from "react-native-safe-area-context";



import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL = 'http://10.74.29.161:9000/signup';
const SignupScreen = () => {
  const [email, setemail] = useState('');
  const [username, setname] = useState('');
  const [password, setpass] = useState('');


  const submit = async () => {
    if (username == '' || password == '' || email == '') {
      Alert.alert('Error', 'Please enter the values');
    } else {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({ email: email, username: username, password: password, }),
        });
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
      catch (error) {
        console.error("Request error:", error); // Log the error from the catch block
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    }
  }



  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar hidden />

      <ImageBackground
        source={require("../assets/images/wave_background_blue.png")}
        resizeMode="stretch"
        style={[GlobalStyles.image, { backgroundColor: "white" }]}
      />

      <SafeAreaView
        style={[
          { flex: 1.5, backgroundColor: "white" },
          GlobalStyles.centeredContainer,
        ]}
      >
        <View style={{ padding: 20 }}>
          <Text style={[GlobalStyles.title, { color: "black" }]}>Sign Up</Text>

          <TextInput
            style={GlobalStyles.input}
            placeholder="email"
            value={email}
            placeholderTextColor="#000080"
            onChangeText={setemail}
          />

          <TextInput
            style={GlobalStyles.input}
            placeholder="username"
            value={username}
            placeholderTextColor="#000080"
            onChangeText={setname}
          />
          <TextInput
            style={GlobalStyles.input}
            placeholder="password"
            value={password}
            placeholderTextColor="#000080"
            onChangeText={setpass}
            secureTextEntry
          />

          <TouchableOpacity style={GlobalStyles.button} onPress={submit}>
            <Text style={GlobalStyles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <Link href="/login" style={{ marginTop: 5 }}>
            <Text style={GlobalStyles.reminder}>
              Already have an account? Sign in here
            </Text>
          </Link>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SignupScreen;
