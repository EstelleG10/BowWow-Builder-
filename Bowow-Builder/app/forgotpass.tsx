import React, { useState } from 'react';
import { Linking, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const ForgotPassScreen = () => {
  const navigation = useNavigation();
  const [email, setemail] = useState('');

  const submit = async () => {

    if (email == '') {
      Alert.alert('Error', 'Please enter the values');
    } else {
      Alert.alert('Success', 'Username and password are entered');
      console.log('Email', email);
    }
  }
  
  return (
    <ImageBackground source={require('../assets/images/background_image.jpg')//
    } style={styles.container}>
      <Text style={styles.log}>Enter Email Address </Text>
      <TextInput style={styles.input} placeholder="email" value={email} onChangeText={setemail} />
      <Link href= '/login'>
            <Text style={styles.forgot}>Back to Sign In</Text>
            </Link>
      <Text style={styles.button} onPress={submit}>Send</Text>
      
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', padding: 20, marginBottom: 20,},
  log: {marginTop: 60,justifyContent: 'center', textAlign: 'center', alignItems: 'center', fontSize: 30, fontWeight: 'bold', color: '#000080', fontFamily: 'SF Pro', marginBottom: 10
  },

  button: {fontWeight: 'bold', justifyContent: 'center', textAlign: 'center', alignItems: 'center', color: 'white', fontSize: 18, padding: 10, marginTop: 20, borderWidth: 1, borderColor: '#FCA950', borderRadius: 15, width: '100%', height: 50, backgroundColor: '#FCA950'
  },
  forgot: { lineHeight: 14, fontWeight: 'bold', textAlign: 'center', color: '#000080', fontFamily: 'SF Pro', fontSize: 14 }
  , 
  input: {justifyContent: 'center', textAlign: 'left', alignItems: 'center', height: 46, fontSize: 13, marginBottom: 20, paddingLeft: 10, borderWidth: 1, borderRadius: 15, width: '100%', borderColor: 'grey', backgroundColor: 'white', color: 'grey'
  },
  signup:{ marginTop: 20, lineHeight: 24, fontWeight: 'bold', color: 'grey', fontFamily: 'SF Pro', fontSize: 15, marginBottom: 40, textAlign: 'center' }
});

export default ForgotPassScreen;