import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyleSheet";

export default function Index() {
  return (
    <ImageBackground
      source={require("../assets/images/take2.png")}
      style={styles.background}
      resizeMode="cover"
    >

      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <View style={styles.content}>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[GlobalStyles.button, { backgroundColor: '#063E68' }]}
              onPress={() => router.push("/login")}
            >
              <Text style={GlobalStyles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[GlobalStyles.button, { backgroundColor: '#063E68' }]}
              onPress={() => router.push("/signup")}
            >
              <Text style={GlobalStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  content: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 250,
    height: 250,
  },
  buttonContainer: {
    marginBottom: 70,
  },
});
