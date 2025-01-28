import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { addFavorite, fetchFavorites, removeFavorite } from '../../services/favoriteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  // const [favoriteAirports, setFavoriteAirports] = useState<any[]>([]);

  const [favorites, setFavorites] = useState<any[]>([]);
  
  const loadFavorites = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const favoritesList = await fetchFavorites(user.uid);
      console.log("favorites list", favoritesList);
      setFavorites(favoritesList);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (airportCode: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert('Error: authenticate before deleting');
      return;
    }
  
    try {
      await removeFavorite(user.uid, airportCode, setFavorites);
      loadFavorites(); // Refresh the list after removal
    } catch (error) {
      Alert.alert('Error', 'failed to delete favorite');
    }
  };
  

  interface Airport {
    airportName: string;
    airportCode: string;
    city: string;
    state: string;
    userId: string;
  }

  const navigateToAirport = (airport: Airport) => {
    router.push({
      pathname: '/Home',
      params: { airport: JSON.stringify(airport) },
    });
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth); 
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email || 'Guest'}!</Text>
      <Text style={styles.sectionTitle}>Your Favorite Airports:</Text>

      <FlatList
  data={favorites}
  keyExtractor={(item) => item.airportCode} // Ensure unique key
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => navigateToAirport(item)} style={styles.airportItem}>
      <Text style={styles.airportName}>{item.airportName}</Text>
      <Text style={styles.airportCity}>{item.city}, {item.state}</Text>
      <Button title="Remove" onPress={() => handleRemoveFavorite(item.airportCode)} />
    </TouchableOpacity>
  )}
  style={styles.list}
/>
      <Button title="Refresh Favorites" onPress={loadFavorites} />

      {/* <Text style={styles.note}>Manage your account settings below:</Text> */}
      <Button title="Sign Out" onPress={handleSignOut} color="#FF6347" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 24,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  list: {
    maxHeight: 300,
    marginBottom: 16,
  },
  airportItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginVertical: 4,
    borderRadius: 8,
  },
  airportText: {
    fontSize: 16,
  },
  note: {
    fontSize: 16,
    marginVertical: 8,
    color: '#555',
  },
  airportName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  airportCity: {
    fontSize: 16,
    color: '#666',
  },
});

export default Profile;