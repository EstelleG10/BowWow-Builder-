import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function Category() {
  const foodItems = ["Crunchy Roll", "Red Rock Roll", "Rainbow Roll", "Tuna Poke Bowl", "California Roll", "Dragon Roll"];

  return (
    <ImageBackground 
      source={require('/Users/amy/project-project-group-5/StickerSmash/assets/background_image.jpg')} 
      style={design.background}
    >
      <ScrollView contentContainerStyle={design.scrollContainer}>
        <View style={design.container}>
          <Text style={design.header}>Sushi</Text>
          <View style={design.grid}>
            {foodItems.map((item, index) => (
              <TouchableOpacity key={index} style={design.itemBox}>
                <View style={design.imagePlaceholder} />
                <Text style={design.itemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const design = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%", 
    height: "100%", 
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    marginTop: 10, 
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",  
    paddingBottom: 20,    
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",  
  },
  itemBox: {
    alignItems: "center",
    margin: 10,
  },
  imagePlaceholder: {
    width: 155,   
    height: 155,
    backgroundColor: "#ddd", 
    borderRadius: 10,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  }
});
