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
import { Link, useFocusEffect, useNavigation } from "expo-router";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyleSheet";

const ForgotPassScreen = () => {
  const router = useRouter();
  const [email, setemail] = useState("");

  const submit = async () => {
    if (email == "") {
      Alert.alert("Error", "Please enter the values");
    } else {
      Alert.alert("Success", "Username and password are entered");
      console.log("Email", email);
      router.push("/login");
    }
  };

  return (
    <SafeAreaProvider
      style={[GlobalStyles.centeredContainer, { backgroundColor: "white" }]}
    >
      <SafeAreaView edges={["top"]}>
        <Text style={[GlobalStyles.title, { color: "black" }]}>
          Enter Email Address{" "}
        </Text>
        <TextInput
          style={GlobalStyles.input}
          placeholder="email"
          value={email}
          onChangeText={setemail}
        />
        <Link href="/login" style={{ marginTop: 5 }}>
          <Text style={GlobalStyles.reminder}>Back to Sign In</Text>
        </Link>

        <TouchableOpacity style={GlobalStyles.button} onPress={submit}>
          <Text style={GlobalStyles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ForgotPassScreen;
