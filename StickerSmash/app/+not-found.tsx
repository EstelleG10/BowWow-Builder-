import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
      <>
    <ImageBackground 
      source={require('/Users/amy/project-project-group-5/StickerSmash/assets/background_image.jpg')} 
      style={design.background}
    >
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={design.styles}>
        <Text style={design.text}>Page not found :/</Text>
        <Link href="/" style={design.button}>
          Go back to Home screen!
        </Link>
       </View>
     </ImageBackground>
    </>
  );
}

const design = StyleSheet.create({
  styles: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: "100%", 
    height: "100%", 
  },
  text: {
    color: "black", 
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: 'black',
  },
});
