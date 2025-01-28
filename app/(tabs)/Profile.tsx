import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [favoriteAirports, setFavoriteAirports] = useState<any[]>([]);

  const fetchFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteAirports');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      setFavoriteAirports(favorites);
    } catch (error) {
      console.error('Failed to fetch favorite airports:', error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFromFavorites = async (index: number) => {
    try {
      const updatedFavorites = favoriteAirports.filter((_, i) => i !== index);
      setFavoriteAirports(updatedFavorites);
      await AsyncStorage.setItem('favoriteAirports', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Failed to remove favorite airport:', error);
    }
  };

  interface Airport {
    facility_name: string;
    city: string;
    state_full: string;
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
        data={favoriteAirports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => navigateToAirport(item)} style={styles.airportItem}>
            <Text style={styles.airportName}>{item.facility_name}</Text>
            <Text style={styles.airportCity}>{item.city}, {item.state_full}</Text>
            <Button title="Remove" onPress={() => removeFromFavorites(index)} />
          </TouchableOpacity>
        )}
        style={styles.list}
      />
      <Button title="Refresh Favorites" onPress={fetchFavorites} />

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