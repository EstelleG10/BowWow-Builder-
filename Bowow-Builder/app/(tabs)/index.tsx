import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const hardcodedBundles = [
  {
    title: 'Hungry Man Special',
    images: [
      require('../../assets/images/image1.jpg'),
      require('../../assets/images/image2-min.png'),
      require('../../assets/images/image3-min.png'),
    ],
  },
  {
    title: 'Snack Restock',
    images: [
      require('../../assets/images/lesserevil_fieryhot.jpg'),
      require('../../assets/images/orville_popcorn.jpg'),
    ],
  },
];

const Home = () => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch('http://10.74.174.145:9000/api/meals');
        const data = await response.json();
        setBundles(data);
      } catch (err) {
        console.error('Error fetching meals:', err);
        setError(true);
      }
    };

    fetchBundles();
  }, []);

  const displayBundles = error || bundles.length === 0 ? hardcodedBundles : bundles;

  return (
    <ImageBackground
      source={require('../../assets/images/background_blue.png')}
      style={styles.background}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.textBox}>
            <Text style={styles.header}>Bow Wow Builder</Text>
            <Text style={styles.textHeader}>The Wows of the Week</Text>
          </View>

          {displayBundles.map((bundle, idx) => (
            <View key={idx} style={styles.bundleBox}>
              <Text style={styles.bundleTitle}>{bundle.title || bundle.name}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {bundle.items
                  ? bundle.items.map((item: any, i: number) => {
                    const trimmedRoute = item.img_route?.trim();
                    return (
                      <View key={i} style={{ marginRight: 15, alignItems: 'center' }}>
                        {trimmedRoute ? (
                          <Image
                            source={{ uri: `http://10.74.29.161:9000/${trimmedRoute}` }}
                            style={styles.bundleImage}
                            onError={() =>
                              console.warn(`Could not load image for ${item.name}`)
                            }
                          />
                        ) : (
                          <View
                            key={`fallback-${i}`}
                            style={[styles.bundleImage, { backgroundColor: '#999' }]}
                          />
                        )}
                        <Text style={styles.itemText}>{item.name}</Text>
                      </View>
                    );
                  })
                  : bundle.images.map((img: any, i: number) => (
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
    resizeMode: 'cover',
    backgroundColor: '#ccc',
  },
  itemText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    width: screenWidth * 0.6,
  },
});

export default Home;
