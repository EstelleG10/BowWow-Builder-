import { View, Text, StyleSheet} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
    return (
        <SafeAreaView>
            <View>
                <Text style = {styles.header}>Bow Wow Builder</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  header: {textAlign: 'left', fontSize: 48, fontWeight:'bold'},
});

export default Home;