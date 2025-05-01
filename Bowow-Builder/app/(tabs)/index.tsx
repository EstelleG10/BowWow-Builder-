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
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Constants from '../../constants';

const StarRating = ({ rating, onChange }) => (
  <View style={{ flexDirection: "row" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Pressable
        key={n}
        onPress={() => onChange(n)}
        style={{ marginHorizontal: 2 }}
      >
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
  const [error, setError] = useState(false);
  const [ratings, setRatings] = useState<{ [mealId: number]: string }>({});
  const [comments, setComments] = useState<{ [mealId: number]: any[] }>({});
  const [loading, setLoading] = useState(false);
  const [showNoBundlesMessage, setShowNoBundlesMessage] = useState(false);


  const fetchComments = async (mealId: number) => {
    try {
      const res = await fetch(Constants.IP_ADDRESS + `api/meals/${mealId}/comments`);
      const data = await res.json();
      setComments(prev => ({ ...prev, [mealId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const submitRating = async (mealId: number, rating: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(Constants.IP_ADDRESS + "api/ratings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_id: mealId,
          rating: parseInt(rating),
        }),
      });

      const data = await res.json();
      console.log("Rating response:", data);

      if (res.status === 400 && data.error === "You have already rated this meal!") {
        alert("You already rated this meal!");
      } else if (res.ok) {
        alert("Thanks for rating!");
        await fetchBundles(); // Refresh bundles
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Network error! Please try again later.");
    }
  };

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(Constants.IP_ADDRESS + 'api/meals');
      let data = await response.json();

      data.sort((a, b) => {
        const ratingA = a.avg_rating ?? 0;
        const ratingB = b.avg_rating ?? 0;
        return ratingB - ratingA;
      });

      setBundles(data);

      setShowNoBundlesMessage(data.length === 0);


      data.forEach((meal: any) => fetchComments(meal.id));
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('An error occurred.');
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBundles();
    }, [fetchBundles])
  );

  const displayBundles = bundles;

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
              {showNoBundlesMessage && (
                <Text style={styles.noBundlesMessage}>
                  You haven’t created any bundles yet! Build your first one!
                </Text>
              )}
            </View>

            {displayBundles.map((bundle, idx) => (
              <View key={idx} style={styles.bundleBox}>
                <Text style={styles.bundleTitle}>{bundle.title || bundle.name}</Text>
                <Text style={styles.posterText}>Posted by: {bundle.poster}</Text>
                {bundle.avg_rating !== undefined && (
                  <Text style={styles.ratingDisplay}>
                    Average Rating: {bundle.avg_rating} 
                  </Text>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <StarRating
                    rating={parseInt(ratings[bundle.id]) || 0}
                    onChange={(val) =>
                      setRatings((prev) => ({ ...prev, [bundle.id]: String(val) }))
                    }
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
                  {bundle.items.map((item: any, i: number) => {
                    const trimmedRoute = item.img_route?.trim();
                    return (
                      <View key={i} style={{ marginRight: 15, alignItems: 'center' }}>
                        {trimmedRoute ? (
                          <Image
                            source={{ uri: Constants.IP_ADDRESS + trimmedRoute }}
                            style={styles.bundleImage}
                            resizeMode="contain"
                            onError={() => console.warn(`Could not load image for ${item.name}`)}
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
                  })}
                </ScrollView>

                {comments[bundle.id]?.length > 0 && (
                  <View style={styles.commentSection}>
                    <Text style={styles.commentHeader}>What people are saying:</Text>
                    {comments[bundle.id].map((c, i) => (
                      <View key={i} style={styles.commentBox}>
                        <Text style={styles.commentUser}>{c.user}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => handleDeleteComment(c.id, bundle.id)}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
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


// make sure the width matches user phone
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
    backgroundColor: 'white',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  commentUser: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },

  commentText: {
    color: '#EEE',
    fontSize: 14,
    lineHeight: 20,
  },

  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#aa2e2e',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },


  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  noBundlesMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    paddingTop: 10,
    fontStyle: 'italic',
  },

  posterText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
    fontStyle: 'italic',
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


});

export default Home;