import { StyleSheet, View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import GlobalStyles from "../../styles/GlobalStyleSheet";

const Profile = () => {
  return (
    <SafeAreaProvider style={{ backgroundColor: "white" }}>
      <SafeAreaView edges={["top"]}>
        <View style={GlobalStyles.container}>
          {/* Profile Section */}
          <Text style={[GlobalStyles.title, { color: "black" }]}>Profile</Text>

          {/* Account Information */}
          <View style={styles.accountCard}>
            <Text style={styles.accountHeader}>Account</Text>
            <View style={styles.accountInfo}>
              <Text style={styles.accountText}>Username: RandomName</Text>
              <Text style={styles.accountText}>Email: RandomName@yale.edu</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>25</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.5</Text>
              <Text style={styles.statLabel}>Average Stars</Text>
            </View>
          </View>

          {/* Bundle History */}
          <Text style={[GlobalStyles.header, { fontWeight: "normal" }]}>
            Bundle History
          </Text>
          <View style={GlobalStyles.divider} />

          {/* Scrollable Section */}
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.bundleCard}>
              <View style={styles.bundleHeader}>
                <Text style={styles.label}>Hungry Man Special</Text>
                <Text style={styles.timestamp}>May 8, 12:30 pm</Text>
              </View>
              <View style={styles.foodItems}>
                <Text style={styles.foodItem}>1x Sandwich</Text>
                <Text style={styles.foodItem}>1x Water</Text>
                <Text style={styles.foodItem}>2x Yogurt</Text>
              </View>
            </View>

            <View style={styles.bundleCard}>
              <View style={styles.bundleHeader}>
                <Text style={styles.label}>Snack Restock</Text>
                <Text style={styles.timestamp}>May 8, 12:30 pm</Text>
              </View>
              <View style={styles.foodItems}>
                <Text style={styles.foodItem}>2x Popcorn</Text>
                <Text style={styles.foodItem}>5x Chocolate</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  accountCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginTop: 20,
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
  statsCard: {
    backgroundColor: "#002F6A",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 14,
    color: "white",
  },
  bundleCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bundleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  foodItems: {
    marginLeft: 10,
    marginBottom: 10,
  },
  foodItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});

export default Profile;
