import {StyleSheet, View, Text, ScrollView, StatusBar, ImageBackground} from 'react-native';
import React from 'react'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import FeedList from '../../components/FeedList'

const Home = () => {
    return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style = {styles.textBox}>
            <Text style = {styles.header}>Bow Wow Builder</Text>
            <Text style = {styles.textHeader}>The wows of the week</Text>
        </View>
          <ImageBackground 
            source={require('../../assets/images/background_blue.png')}
            resizeMode="cover">
            <FeedList color="#FFFFFF" />
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  textBox: {padding: 20},
  header: {textAlign: 'left', fontSize: 48, fontWeight:'bold', color:'#01397E'},
  textHeader: {textAlign: 'left', fontSize: 20, color:'#01397E', paddingTop:10, }
});

export default Home;