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
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyleSheet";
import * as Constants from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.IP_ADDRESS + "login";

const LoginScreen = () => {
  const router = useRouter();
  const [username, setname] = useState("");
  const [password, setpass] = useState("");

  const submit = async () => {
    if (username === "" || password === "") {
      Alert.alert("Error", "Please enter the values");
    } else {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });
        const data = await response.json();
        if (response.status === 200 && data.token) {
          const { token } = data;
          await AsyncStorage.setItem("token", token);
          Alert.alert("Success", "Username and password are entered");
          router.replace("/(tabs)");
        } else {
          Alert.alert("Login failed", "Invalid username or password");
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    }
  };

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar hidden />
      <ImageBackground
        source={require("../assets/images/login.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            {/* <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            > */}
              <SafeAreaView
                style={[
                  { flex: 1.5, paddingTop: 80 },
                  GlobalStyles.container,
                ]}
              >
                <Text style={[GlobalStyles.title, { color: "black", textAlign: "center" }]}>
                  Login
                </Text>

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
                  <Text style={GlobalStyles.buttonText}>Login</Text>
                </TouchableOpacity>

                <Link href="/signup" style={{ marginTop: 5 }}>
                  <Text style={[GlobalStyles.reminder, { textAlign: "center" }]}>
                    Don't have an account? Register Now
                  </Text>
                </Link>
              </SafeAreaView>
            {/* </ScrollView> */}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </SafeAreaProvider>
  );
};

export default LoginScreen;
