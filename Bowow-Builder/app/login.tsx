import React, { useState } from 'react';
import { Linking, View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setname] = useState('');
  const [password, setpass] = useState('');

  const submit = async () => {

    if (username == '' || password == '') {
      Alert.alert('Error', 'Please enter the values');
    } else {
      Alert.alert('Success', 'Username and password are entered');
      console.log('Username', username);
      console.log('Password', password);
    }
  }
  
  return (
    <ImageBackground source={require('../assets/images/background_image.jpg')//
    } style={styles.container}>
      <Text style={styles.log}>Login here </Text>
      <Text style={{  lineHeight: 24, fontWeight: 'bold', color: 'black', fontFamily: 'SpaceMono-Regular', fontSize: 17, textAlign: 'center' }}> Welcome back you've </Text>
      <Text style={{ lineHeight: 24, fontWeight: 'bold', color: 'black', fontFamily: 'SF Pro', fontSize: 17, marginBottom: 40, textAlign: 'center' }}>been missed! </Text>
      <TextInput style={styles.input} placeholder="username" value={username} onChangeText={setname} />
      <TextInput style={styles.input} placeholder="password" value={password} onChangeText={setpass} secureTextEntry />
      <Link href= '/forgotpass'>
      <Text style={styles.forgot}>Forgot your password?</Text>
      </Link>
      <Text style={styles.button} onPress={submit}>Sign in</Text>
      <Link href = '/signup'>
        <Text style={styles.signup}>Don't have an account? Register Now</Text>
      </Link>
      </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', padding: 20, marginBottom: 20,},
  log: {marginTop: 60,justifyContent: 'center', textAlign: 'center', alignItems: 'center', fontSize: 30, fontWeight: 'bold', color: '#000080', fontFamily: 'SF Pro', marginBottom: 10
  },
  input: {justifyContent: 'center', textAlign: 'left', alignItems: 'center', height: 46, fontSize: 13, marginBottom: 20, paddingLeft: 10, borderWidth: 1, borderRadius: 15, width: '100%', borderColor: '#BEDCF9', backgroundColor: '#BEDCF9', color: 'grey'
  },
  button: {fontWeight: 'bold', justifyContent: 'center', textAlign: 'center', alignItems: 'center', color: 'white', fontSize: 18, padding: 10, marginTop: 20, borderWidth: 1, borderColor: '#FCA950', borderRadius: 15, width: '100%', height: 50, backgroundColor: '#FCA950'
  },
  forgot: { lineHeight: 14, fontWeight: 'bold', textAlign: 'right', color: '#000080', fontFamily: 'SF Pro', fontSize: 14 }
  , 
  signup:{ marginTop: 20, lineHeight: 24, fontWeight: 'bold', color: 'grey', fontFamily: 'SF Pro', fontSize: 15, marginBottom: 40, textAlign: 'center' }
});

export default LoginScreen;
