import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Image,
  TextInput,
  Pressable,
  StatusBar,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Constants from '../../constants';

const StarRating = ({ rating, onChange }) => (
  <View style={{ flexDirection: "row" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Pressable key={n} onPress={() => onChange(n)} style={{ marginHorizontal: 2 }}>
        <FontAwesome
          name={n <= rating ? "star" : "star-o"}
          size={24}
          color="#FFD700"
        />
      </Pressable>
    ))}
  </View>
);

const Home = () => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [ratings, setRatings] = useState<{ [mealId: number]: string }>({});
  const [comments, setComments] = useState<{ [mealId: number]: any[] }>({});
  const [showNoBundlesMessage, setShowNoBundlesMessage] = useState(false);
  const [username, setUsername] = useState('');

  const fetchUsername = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username);
    }
  };

  const fetchComments = async (mealId: number) => {
    try {
      const res = await fetch(Constants.IP_ADDRESS + `api/meals/${mealId}/comments`);
      const data = await res.json();
      setComments(prev => ({ ...prev, [mealId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const fetchBundles = useCallback(async () => {
    try {
      const response = await fetch(Constants.IP_ADDRESS + 'api/meals');
      let data = await response.json();
      data.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
      setBundles(data);
      setShowNoBundlesMessage(data.length === 0);
      data.forEach((meal: any) => fetchComments(meal.id));
    } catch (err) {
      console.error('Error fetching meals:', err);
    }
  }, []);

  const submitRating = async (mealId: number, rating: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(Constants.IP_ADDRESS + "api/ratings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ meal_id: mealId, rating: parseInt(rating) }),
      });
      const data = await res.json();
      if (res.status === 400 && data.error === "You have already rated this meal!") {
        alert("You already rated this meal!");
      } else if (res.ok) {
        alert("Thanks for rating!");
        await fetchBundles();
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      alert("Network error! Please try again later.");
    }
  };

  const handleDeleteComment = async (commentId: number, mealId: number) => {
    try {
      const res = await fetch(Constants.IP_ADDRESS + `api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchComments(mealId);
      } else {
        alert('Failed to delete comment.');
      }
    } catch {
      alert('An error occurred.');
    }
  };

  const handleDeleteBundle = async (bundleId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(Constants.IP_ADDRESS + `api/meals/${bundleId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBundles();
      } else {
        alert("Failed to delete bundle.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  useEffect(() => {
    fetchUsername();
    fetchBundles();
  }, []);

  useFocusEffect(useCallback(() => { fetchBundles(); }, [fetchBundles]));

  return (
    <ImageBackground source={require('../../assets/images/dark_blue.jpg')} style={styles.background}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={styles.textBox}>
              <Text style={styles.header}>Bow Wow Builder</Text>
              <Text style={styles.textHeader}>The Wows of the Week</Text>
              {showNoBundlesMessage && (
                <Text style={styles.noBundlesMessage}>
                  You haven’t created any bundles yet! Build your first one!
                </Text>
              )}
            </View>

            {bundles.map((bundle, idx) => (
              <View key={idx} style={styles.bundleBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 }}>
                  <View>
                    <Text style={styles.bundleTitle}>{bundle.title || bundle.name}</Text>
                    <Text style={styles.posterText}>Posted by: {bundle.poster}</Text>
                  </View>
                  {bundle.poster === username && (
                    <Pressable onPress={() => handleDeleteBundle(bundle.id)}>
                      <Image source={require('../../assets/images/trash.png')} style={{ width: 20, height: 20 }} />
                    </Pressable>
                  )}
                </View>

                {bundle.avg_rating !== undefined && (
                  <Text style={styles.ratingDisplay}>Average Rating: {bundle.avg_rating}</Text>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <StarRating
                    rating={parseInt(ratings[bundle.id]) || 0}
                    onChange={(val) => setRatings((prev) => ({ ...prev, [bundle.id]: String(val) }))}
                  />
                  <Pressable style={styles.submitButton} onPress={() => {
                    const rating = ratings[bundle.id];
                    if (rating && /^[1-5]$/.test(rating)) {
                      submitRating(bundle.id, rating);
                    } else {
                      alert('Please enter a number from 1 to 5');
                    }
                  }}>
                    <Text style={styles.submitText}>Submit</Text>
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {bundle.items.map((item: any, i: number) => (
                    <View key={i} style={{ marginRight: 15, alignItems: 'center' }}>
                      {item.img_route?.trim() ? (
                        <Image
                          source={{ uri: Constants.IP_ADDRESS + item.img_route.trim() }}
                          style={styles.bundleImage}
                          resizeMode="contain"
                        />
                      ) : <View style={[styles.bundleImage, { backgroundColor: '#999' }]} />}
                      <Text style={styles.itemText}>{item.name}</Text>
                    </View>
                  ))}
                </ScrollView>

                {comments[bundle.id]?.length > 0 && (
                  <View style={styles.commentSection}>
                    <Text style={styles.commentHeader}>What people are saying:</Text>
                    {comments[bundle.id].map((c, i) => (
                      <View key={i} style={[styles.commentBox, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.commentUser}>{c.user}</Text>
                          <Text style={styles.commentText}>{c.text}</Text>
                        </View>
                        {c.user === username && (
                          <Pressable onPress={() => handleDeleteComment(c.id, bundle.id)} style={{ paddingLeft: 10 }}>
                            <Image source={require('../../assets/images/trash.png')} style={{ width: 20, height: 20 }} />
                          </Pressable>
                        )}
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
                        const token = await AsyncStorage.getItem("token");
                        await fetch(Constants.IP_ADDRESS + "api/comments", {
                          method: "POST",
                          headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            meal_id: bundle.id,
                            text: text.trim(),
                          }),
                        });

                        fetchComments(bundle.id);
                        setRatings((prev) => ({ ...prev, [`comment_${bundle.id}`]: '' }));
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
    paddingTop: StatusBar.currentHeight
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  textBox: {
    padding: 20
  },
  header: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white'
  },
  textHeader: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    paddingTop: 10
  },
  bundleBox: {
    marginTop: 20,
    paddingLeft: 20
  },
  bundleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white'
  },
  posterText: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic'
  },
  ratingDisplay: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 8
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  submitText: {
    fontWeight: 'bold',
    color: '#000'
  },
  bundleImage: {
    width: screenWidth * 0.6,
    height: 180,
    marginRight: 15,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  itemText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    width: screenWidth * 0.6
  },
  commentSection: {
    marginTop: 10,
    paddingRight: 20
  },
  commentHeader: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6
  },
  commentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentUser: { color: '#FFD700', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  commentText: { color: '#EEE', fontSize: 14, lineHeight: 20 },
  commentInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#000',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  noBundlesMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    paddingTop: 10,
    fontStyle: 'italic',
  },
});

export default Home;
