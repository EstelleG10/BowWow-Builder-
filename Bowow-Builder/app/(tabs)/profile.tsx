import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Constants from "../../constants";
import GlobalStyles from "../../styles/GlobalStyleSheet";
import { useFocusEffect } from "expo-router";

type Bundle = {
  id: number;
  name: string;
  created_at: string;
  items: string[];
};

export default function Profile() {
  // variables for profile data
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bundleCount, setBundleCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [bundles, setBundles] = useState<Bundle[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      (async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token found — user may not be logged in.");
          return;
        }

        try {
          const res = await fetch(`${Constants.IP_ADDRESS}api/my-meals`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          if (isActive) {
            setUsername(data.username);
            setEmail(data.email);
            setBundleCount(data.bundleCount);
            setAvgRating(data.avgRating);
            setBundles(data.bundles);
          }
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <ImageBackground
      source={require('../../assets/images/background_white.jpg')}
      style={styles.background}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.wrapper}>
            {/* Profile Header */}
            <Text style={[GlobalStyles.title, { color: "black" }]}>Profile</Text>

            {/* Account Information */}
            <View style={styles.accountCard}>
              <Text style={styles.accountHeader}>Account</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountText}>Username: {username}</Text>
                <Text style={styles.accountText}>Email: {email}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bundleCount}</Text>
                <Text style={styles.statLabel}>Bundles</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Stars</Text>
              </View>
            </View>

            {/* History */}
            <Text style={[GlobalStyles.header, styles.historyTitle]}>Bundle History</Text>
            <View style={GlobalStyles.divider} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {bundles.map((b) => (
                <View key={b.id} style={styles.bundleCard}>
                  <View style={styles.bundleHeader}>
                    <Text style={styles.label}>{b.name}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(b.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.foodItems}>
                    {b.items.map((item, i) => (
                      <Text key={i} style={styles.foodItem}>
                        {/* FIX THIS LATER ESTELLE THIS MEANS ONLY ITEMS SHOWNON PROF */}
                        • {item.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,

  },
  accountCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  accountHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  accountInfo: {
    marginTop: 5,
  },
  accountText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "black",
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: "#002F6A",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: "white" },
  statLabel: { fontSize: 14, color: "white", marginTop: 4 },
  historyTitle: {
    fontWeight: "normal",
    marginBottom: 8,
  },
  scrollContainer: { paddingBottom: 20 },
  bundleCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
  },
  bundleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timestamp: { fontSize: 12, color: "gray" },
  label: { fontSize: 16, fontWeight: "bold", color: "#333" },
  foodItems: { marginLeft: 8 },
  foodItem: { fontSize: 16, color: "#333", marginBottom: 4 },
});