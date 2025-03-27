import { Link } from "expo-router";
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <ImageBackground 
      source={require('/Users/amy/project-project-group-5/StickerSmash/assets/background_image.jpg')} 
      style={design.background}
    >
      <View style={design.styles}>
        <Text style={design.text}>Main Page.</Text>
      </View>
    </ImageBackground>
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
  // button: {
  //   fontSize: 20,
  //   textDecorationLine: "underline",
  //   color: "black",
  // }
});


