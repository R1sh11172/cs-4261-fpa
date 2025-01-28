import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { getAirportInfo, getAirportCharts, getWeather } from '../../services/aviationApiService';
import { AirportInfo } from '../../types'; // Import the AirportInfo type
import { addReview, fetchReviews } from '../../services/reviewService';
import { addFavorite, fetchFavorites } from '../../services/favoriteService';
import { getAuth } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this for storage
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';


export default function Home() {
  const [airportCode, setAirportCode] = useState('');
  const [airportInfo, setAirportInfo] = useState<AirportInfo | null>(null);
  const [airportCharts, setAirportCharts] = useState<{ title: string; url: string; thumbnail: string }[]>([]);
  const [weatherData, setWeatherData] = useState<{ temp: number; wspd: number } | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);


  const mapChartsData = (rawData: Record<string, any>) => {
    const airportCode = Object.keys(rawData)[0]; // Get the first key (e.g., "KSEA")
    const charts = rawData[airportCode] || []; // Extract charts for the given airport
  
    return charts.map((chart: any) => ({
      title: chart.chart_name || 'No Title',
      url: chart.pdf_path || '#',
      thumbnail: chart.thumbnail || 'https://via.placeholder.com/150', // Placeholder for missing thumbnails
    }));
  };

  const getWeatherIcon = (temp: number) => {
    if (temp > 15.5) return '☀️'; // Sunny
    if (temp > 4.4 && temp <= 15.5) return '☁️'; // Cloudy
    return '❄️'; // Snowflake
  };
  

  const fetchAirportData = async () => {
    try {
      const iaco = 'K' + airportCode;
      console.log(iaco);


      const data = await getAirportInfo(iaco);
      const airportDetails = data[iaco.toUpperCase()];
      // console.log('Airport code:', airportCode);
      // console.log('Airport data:', data);
      // console.log('Airport details:', airportDetails);

      if (!airportDetails) {
        Alert.alert('Error', 'No data found for this airport code.');
      } else {
        setAirportInfo(airportDetails[0]);
      }

      const weather = await getWeather(iaco);
      console.log('Weather:', weather);
      setWeatherData({
        temp: weather.temp,
        wspd: weather.wspd
      });

      const chartsData = await getAirportCharts(iaco);
      const charts = chartsData[iaco.toUpperCase()];
      // console.log('Airport charts: ', chartsData)
      const formattedCharts = mapChartsData(chartsData);
      if (!charts) {
        
      } else {
        setAirportCharts(formattedCharts);
      }

      await loadReviews();
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch airport data.');
      console.log(error)
    }
  };

  // const handleAddToFavorites = async () => {
  //   const auth = getAuth();
  //   const user = auth.currentUser;
  //   if (!user) {
  //     Alert.alert('Error', 'You must be logged in to add to favorites.');
  //     return;
  //   }

  //   if (!airportCode) {
  //     Alert.alert('Error', 'Please enter an airport code.');
  //     return;
  //   }
  
  //   if (airportInfo?.faa_ident !== airportCode.toUpperCase()) {
  //     Alert.alert('Error', 'Please fetch airport data first.');
  //     return;
  //   }

  //   const userId = user.uid;
  //   await loadFavorites();

  //   // Check if the user has already added this airport to their favorites
  //   const existingFavorite = favorites.find((favorite) => favorite.userId === user.uid && favorite.airportCode === airportCode.toUpperCase());
  //   if (existingFavorite) {
  //     Alert.alert('Error', 'This airport is already in your favorites.');
  //     return;
  //   }
  
  //   try {
  //     const newCode = airportCode.toUpperCase();
  //     await addFavorite(newCode, user.uid, airportInfo?.facility_name, airportInfo?.city, airportInfo?.state_full);
  //     Alert.alert('Success', 'Airport added to favorites!');
  //     loadFavorites(); // Refresh favorites list
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to add airport to favorites.');
  //   }
  // };

  const handleAddToFavorites = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add to favorites.');
      return;
    }
  
    if (!airportCode) {
      Alert.alert('Error', 'Please enter an airport code.');
      return;
    }
  
    if (airportInfo?.faa_ident !== airportCode.toUpperCase()) {
      Alert.alert('Error', 'Please fetch airport data first.');
      return;
    }
  
    try {
      // Instead of loadFavorites() + setFavorites() + reading from favorites,
      // fetch the user's favorites here and check them directly:
      const freshFavorites = await fetchFavorites(user.uid);
      const alreadyFavorite = freshFavorites.find(
        (fav) => fav.userId === user.uid && fav.airportCode === airportCode.toUpperCase()
      );
  
      if (alreadyFavorite) {
        // Alert.alert('Error', 'This airport is already in your favorites.');
        return;
      }
  
      const newCode = airportCode.toUpperCase();
      await addFavorite(newCode, user.uid, airportInfo?.facility_name, airportInfo?.city, airportInfo?.state_full);
  
      // Now update your component state so it stays in sync
      setFavorites([...freshFavorites, {
        airportCode: newCode,
        userId: user.uid,
        airportName: airportInfo?.facility_name,
        city: airportInfo?.city,
        state: airportInfo?.state_full,
      }]);
      Alert.alert('Success', 'Airport added to favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add airport to favorites.');
    }
  };
  
  
  const loadFavorites = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const favoritesList = await fetchFavorites(user.uid);
      setFavorites(favoritesList);
    }
  };

  useEffect(() => {
    loadFavorites(); // Load favorites when Home component mounts
  }, []);

  const handleAddReview = async () => {
    const numericRating = Number(rating);
    if (!rating || isNaN(numericRating) || numericRating < 0 || numericRating > 10) {
      Alert.alert('Error', 'Please enter a valid rating (0-10).');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a review.');
      return;
    }

    const userId = user.uid;
  
    // Check if the user has already submitted a review
    const existingReview = reviews.find((review) => review.userId === user.uid); // Replace 'testUserId' with the logged-in user's ID
    if (existingReview) {
      Alert.alert('Error', 'You have already submitted a review for this airport.');
      return;
    }
    console.log("NEW REVIEW")
  
    try {
      const newCode = airportCode.toUpperCase();
      await addReview(newCode, numericRating, comment, user.uid);
      Alert.alert('Success', 'Review added successfully!');
      loadReviews(); // Refresh reviews
    } catch (error) {
      Alert.alert('Error', 'Failed to add review.');
    }
  };
  

  const loadReviews = async () => {
    const newCode = airportCode.toUpperCase();
    const { reviews, averageRating } = await fetchReviews(newCode);
    setReviews(reviews);
    setAverageRating(averageRating);
  };


return (
  <ScrollView style={styles.scrollContainer}>
    <Text style={styles.title}>Airport<Text style={styles.wiki}>Wiki</Text> ✈️</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter FAA code (e.g., ATL)"
      value={airportCode}
      onChangeText={setAirportCode}
    />
    <Button title="Fetch Airport Info" onPress={fetchAirportData} />
    {<Button title="Add to Favorites" onPress={handleAddToFavorites} />}
    {/* <View>
      <Text style={styles.subtitle}>My Favorite Airports</Text>
      {favorites.length === 0 ? (
        <Text>No favorite airports yet.</Text>
      ) : (
        favorites.map((favorite, index) => (
          <Text key={index}>{favorite.airportName}</Text>
        ))
      )}
    </View> */}
    {airportInfo && (
      <View style={styles.result}>
        <Text style={styles.infoText}>Name: {airportInfo.facility_name}</Text>
        <Text style={styles.infoText}>City: {airportInfo.city}</Text>
        <Text style={styles.infoText}>State: {airportInfo.state_full}</Text>
        <Text style={styles.infoText}>Manager: {airportInfo.manager}</Text>
        <Text style={styles.infoText}>Phone: {airportInfo.manager_phone}</Text>
        <Text style={styles.infoText}>Elevation: {airportInfo.elevation} ft</Text>
        <Text style={styles.infoText}>Latitude: {airportInfo.latitude}</Text>
        <Text style={styles.infoText}>Longitude: {airportInfo.longitude}</Text>
        <Text style={styles.infoText}>
          Control Tower: {airportInfo.control_tower === 'Y' ? 'Yes' : 'No'}
        </Text>
      </View>
    )}
          {weatherData && (
  <View style={styles.weatherContainer}>
    <View style={styles.weatherLeft}>
      <Text style={styles.weatherIcon}>{getWeatherIcon(weatherData.temp)}</Text>
      <Text style={styles.weatherTemp}>
        {((weatherData.temp * 1.8) + 32).toFixed(1)}°F
      </Text>
    </View>
    <View style={styles.divider} />
    <View style={styles.weatherRight}>
      <Text style={styles.weatherLabel}>Wind Speed</Text>
      <Text style={styles.windSpeed}>{weatherData.wspd} knots</Text>
    </View>
  </View>
)}
    {airportCharts.length > 0 && (
        <View style={styles.chartsContainer}>
          <Text style={styles.subtitle}>Aviation Charts</Text>
          {airportCharts.slice(0, 5).map((chart, index) => ( // display only 5 charts
              <View key={index} style={styles.chartItem}>
              <Image
                source={{ uri: chart.thumbnail }}
                style={styles.chartThumbnail}
              />
              <Text style={styles.chartTitle}>{chart.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (chart.url === '#') {
                    Alert.alert('Unavailable', 'This chart does not have a valid URL.');
                  } else {
                    Linking.openURL(chart.url); // Open the PDF
                  }
                }}
              >
                <Text style={styles.chartLink}>View Chart (PDF)</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {airportInfo && (
        <View style={styles.container}>
        <Text style={styles.subtitle}>Add a Review</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a rating (0-10)"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter a comment (optional)"
          value={comment}
          onChangeText={setComment}
        />
        <Button title="Submit Review" onPress={handleAddReview} />
  
        <Text style={styles.average}>
          Average Rating: {averageRating} ({'★'.repeat(Math.round(Number(averageRating) / 2)) + '☆'.repeat(5 - Math.round(Number(averageRating) / 2))})
        </Text>


        <Text style={styles.subtitle}>Reviews</Text>
        {reviews.map((review, index) => (
          <Text key={index}>
            {review.rating}/10 - {review.comment}
          </Text>
        ))}
      </View>
      )}
      <Text style={styles.blank}></Text>
      <Text style={styles.blank}></Text>
      <Text style={styles.blank}></Text>
      <Text style={styles.blank}></Text>

  </ScrollView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  backgroundColor: '#f8f9fa',
},
title: {
  fontSize: 48,
  fontWeight: 'bold',
  marginVertical: 20,
  textAlign: 'center',
},
subtitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginVertical: 20,
  textAlign: 'center',
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  marginBottom: 20,
  borderRadius: 5,
},
result: {
  marginTop: 20,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  backgroundColor: '#fff',
},
infoText: {
  fontSize: 16,
  marginBottom: 5,
},
chartsContainer: {
  marginTop: 20,
},
chartItem: {
  marginBottom: 20,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 5,
  backgroundColor: '#fff',
},
chartName: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
},
chartCode: {
  fontSize: 14,
  color: '#555',
  marginBottom: 5,
},
chartThumbnail: {
  width: 0,
  height: 20,
  marginRight: 10,
},
chartLink: {
  fontSize: 14,
  color: '#007bff',
  textDecorationLine: 'underline',
},
chartTitle: {
  fontSize: 16,
  color: '#007bff',
},
weatherContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 20,
  backgroundColor: '#ffffff',
  borderRadius: 10,
  marginTop: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 5,
},
weatherLeft: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
weatherIcon: {
  fontSize: 60, // Larger icon size
},
weatherTemp: {
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 10,
},
wiki: {
  color: '#007bff',
},
divider: {
  width: 1,
  height: '80%',
  backgroundColor: '#ccc',
  marginHorizontal: 20,
},
weatherRight: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
weatherLabel: {
  fontSize: 16,
  color: '#555',
  marginBottom: 5,
},
windSpeed: {
  fontSize: 24,
  fontWeight: 'bold',
},
average: { fontSize: 16, marginVertical: 10 },
scrollContainer: {
  flex: 1,
  padding: 20, // Add padding for better spacing
  paddingBottom: 0,
  backgroundColor: '#f8f9fa',
},
blank: {
  fontSize: 48,
  fontWeight: 'bold',
  marginVertical: 20,
  textAlign: 'center',
  color: "#f8f9fa"
},
});