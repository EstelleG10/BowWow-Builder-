import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyleSheet";


import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://13.58.115.85:9000/login';
const LoginScreen = () => {
  const router = useRouter();
  const [username, setname] = useState('');
  const [password, setpass] = useState('');

  const submit = async () => {
    if (username == '' || password == '') {
      Alert.alert('Error', 'Please enter the values');
    } else {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });
        const data = await response.json();
        if (response.status === 200 && data.token) {
          const { token } = data;
          await AsyncStorage.setItem('jwt_token', token);
          Alert.alert('Success', 'Username and password are entered');
          console.log('Username', username);
          console.log('Password', password);
          router.replace('/(tabs)');
        }
        else {
          Alert.alert("login failed", "invalid user or password")
        }
      }
      catch (error) {
        Alert.alert("error", "error occured. Please try again.")
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
            GlobalStyles.container,
          ]}
        >
          <Text style={[GlobalStyles.title, { color: "black" }]}>Login</Text>

          <TextInput
            style={GlobalStyles.input}
            placeholder="username"
            placeholderTextColor="#000080"
            value={username}
            onChangeText={setname}
          />

          <TextInput
            style={GlobalStyles.input}
            placeholder="password"
            placeholderTextColor="#000080"
            value={password}
            onChangeText={setpass}
            secureTextEntry
          />

          <Link href="/forgotpass" style={{ marginTop: 5 }}>
            <Text style={[GlobalStyles.reminder, { textAlign: "right" }]}>
              Forgot your password?
            </Text>
          </Link>

          <TouchableOpacity style={GlobalStyles.button} onPress={submit}>
            <Text style={GlobalStyles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <Link href="/signup" style={{ marginTop: 5 }}>
            <Text style={[GlobalStyles.reminder, { textAlign: "center" }]}>
              Don't have an account? Register Now
            </Text>
          </Link>
        </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default LoginScreen;