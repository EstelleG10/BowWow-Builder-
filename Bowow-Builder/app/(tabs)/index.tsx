import { StyleSheet, View, Text, ScrollView, StatusBar, ImageBackground, Image, Dimensions } from 'react-native';
import React from 'react';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const bundles = [
  {
    title: 'Hungry Man Special',
    images: [
      require('../../assets/images/image1.jpg'),
      require('../../assets/images/image2-min.png'),
      require('../../assets/images/image3-min.png'),
    ]
  },
  {
    title: 'Snack Restock',
    images: [
      require('../../assets/images/lesserevil_fieryhot.jpg'),
      require('../../assets/images/orville_popcorn.jpg'),
    ]
  }
];

const Home = () => {
  return (
    <ImageBackground source={require('../../assets/images/background_blue.png')} style={styles.background}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.textBox}>
            <Text style={styles.header}>Bow Wow Builder</Text>
            <Text style={styles.textHeader}>The Wows of the Week</Text>
          </View>

          {bundles.map((bundle, idx) => (
            <View key={idx} style={styles.bundleBox}>
              <Text style={styles.bundleTitle}>{bundle.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {bundle.images.map((img, i) => (
                  <Image key={i} source={img} style={styles.bundleImage} />
                ))}
              </ScrollView>
            </View>
          ))}
        </SafeAreaView>
      </SafeAreaProvider>
    </ImageBackground>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textBox: {
    padding: 20,
  },
  header: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  textHeader: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    paddingTop: 10,
  },
  bundleBox: {
    marginTop: 20,
    paddingLeft: 20,
  },
  bundleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  bundleImage: {
    width: screenWidth * 0.6,
    height: 180,
    marginRight: 15,
    borderRadius: 10,
  },
});

export default Home;
