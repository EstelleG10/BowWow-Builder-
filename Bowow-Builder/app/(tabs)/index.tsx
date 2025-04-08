import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  ImageBackground,
  Image,
  TextInput,
  Dimensions,
  Pressable,
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

const submitRating = async (mealId: number, rating: string) => {
  const userId = 1; // NEED TO CHANGE LATER 
  try {
    const res = await fetch("http://10.74.29.161:9000/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        meal_id: mealId,
        rating: parseInt(rating),
      }),
    });

    const data = await res.json();
    console.log("Rating response:", data);
    alert("Thanks for rating!");
  } catch (error) {
    console.error("Error submitting rating:", error);
  }
};

const Home = () => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [ratings, setRatings] = useState<{ [mealId: number]: string }>({});
  const [comments, setComments] = useState<{ [mealId: number]: any[] }>({});

  const fetchComments = async (mealId: number) => {
    try {
      const res = await fetch(`http://10.74.29.161:9000/api/meals/${mealId}/comments`);
      const data = await res.json();
      setComments(prev => ({ ...prev, [mealId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch('http://10.74.29.161:9000/api/meals');
        const data = await response.json();
        setBundles(data);
        data.forEach((meal: any) => fetchComments(meal.id));
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
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>

            <View style={styles.textBox}>
              <Text style={styles.header}>Bow Wow Builder</Text>
              <Text style={styles.textHeader}>The Wows of the Week</Text>
            </View>

            {displayBundles.map((bundle, idx) => (
              <View key={idx} style={styles.bundleBox}>
                <Text style={styles.bundleTitle}>{bundle.title || bundle.name}</Text>
                {bundle.avg_rating !== undefined && (
                  <Text style={styles.ratingDisplay}>
                    Average Rating: {bundle.avg_rating} ⭐
                  </Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <TextInput
                    style={styles.ratingInput}
                    placeholder="Rate 1–5"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={1}
                    value={ratings[bundle.id] || ''}
                    onChangeText={(text) => {
                      if (!text || /^[1-5]$/.test(text)) {
                        setRatings((prev) => ({
                          ...prev,
                          [bundle.id]: text,
                        }));
                      }
                    }}
                  />
                  <Pressable
                    style={styles.submitButton}
                    onPress={() => {
                      const rating = ratings[bundle.id];
                      if (rating && /^[1-5]$/.test(rating)) {
                        submitRating(bundle.id, rating);
                      } else {
                        alert('Please enter a number from 1 to 5');
                      }
                    }}
                  >
                    <Text style={styles.submitText}>Submit</Text>
                  </Pressable>
                </View>

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
                              resizeMode="contain"
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

                {comments[bundle.id]?.length > 0 && (
                  <View style={styles.commentSection}>
                    <Text style={styles.commentHeader}>What people are saying:</Text>
                    {comments[bundle.id].map((c, i) => (
                      <View key={i} style={styles.commentBox}>
                        <Text style={styles.commentUser}>{c.user}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={styles.commentInputSection}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="#aaa"
                    value={ratings[`comment_${bundle.id}`] || ''}
                    onChangeText={(text) =>
                      setRatings((prev) => ({ ...prev, [`comment_${bundle.id}`]: text }))
                    }
                  />
                  <Pressable
                    style={styles.submitButton}
                    onPress={async () => {
                      const text = ratings[`comment_${bundle.id}`];
                      if (!text?.trim()) return alert("Comment cannot be empty.");
                      try {
                        await fetch("http://10.74.29.161:9000/api/comments", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            user_id: 1, // 🔁 Change this later to actual logged-in user
                            meal_id: bundle.id,
                            text: text.trim(),
                          }),
                        });
                        fetchComments(bundle.id); // refresh comments
                        setRatings((prev) => ({ ...prev, [`comment_${bundle.id}`]: '' }));
                        alert("Comment posted!");
                      } catch (err) {
                        console.error("Error posting comment:", err);
                      }
                    }}
                  >
                    <Text style={styles.submitText}>Post</Text>
                  </Pressable>
                </View>

              </View>
            ))}
              </ScrollView>

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
  ratingInput: {
    backgroundColor: '#fff',
    color: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    width: 80,
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitText: {
    fontWeight: 'bold',
    color: '#000',
  },
  bundleImage: {
    width: screenWidth * 0.6,
    height: 180,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  itemText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    width: screenWidth * 0.6,
  },
  ratingDisplay: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8,
  },
  commentSection: {
    marginTop: 10,
    paddingRight: 20,
  },
  commentHeader: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  commentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  commentUser: {
    color: '#FFD700',
    fontWeight: '600',
  },
  commentText: {
    color: '#fff',
  },
});

export default Home;