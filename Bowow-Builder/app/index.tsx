import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyleSheet";

export default function Index() {
  return (
    <ImageBackground
      source={require("../assets/images/background_blue.png")}
      style={{ flex: 1, width: "100%", height: "100%"}}
    >
      <View style={styles.overlay}/>
      <SafeAreaProvider
        style={[GlobalStyles.centeredContainer]}
      >
        <SafeAreaView edges={["top"]}>
          <View style={{ margin: 20 }}>
            <Text style={GlobalStyles.title}>
              Welcome to{"\n"}BowWow{"\n"}Builder
            </Text>
            <TouchableOpacity
              style={GlobalStyles.button}
              onPress={() => router.push("/login")}
            >
              <Text style={GlobalStyles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={GlobalStyles.button}
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});