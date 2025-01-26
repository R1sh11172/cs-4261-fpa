import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { getAirportInfo, getAirportCharts, getWeather } from '../../services/aviationApiService';
import { AirportInfo } from '../../types'; // Import the AirportInfo type

export default function Home() {
  const [airportCode, setAirportCode] = useState('');
  const [airportInfo, setAirportInfo] = useState<AirportInfo | null>(null);
  const [airportCharts, setAirportCharts] = useState<{ title: string; url: string; thumbnail: string }[]>([]);
  const [weatherData, setWeatherData] = useState<{ temp: number; wspd: number } | null>(null);


  const mapChartsData = (rawData: Record<string, any>) => {
    const airportCode = Object.keys(rawData)[0]; // Get the first key (e.g., "KSEA")
    const charts = rawData[airportCode] || []; // Extract charts for the given airport
  
    return charts.map((chart: any) => ({
      title: chart.chart_name || 'No Title',
      url: chart.pdf_path || '#',
      thumbnail: chart.thumbnail || 'https://via.placeholder.com/150', // Placeholder for missing thumbnails
    }));
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
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch airport data.');
      console.log(error)
    }
  };

  const getWeatherIcon = (temp: number) => {
    if (temp > 15.5) return '☀️'; // Sunny
    if (temp > 4.4 && temp <= 15.5) return '☁️'; // Cloudy
    return '❄️'; // Snowflake
  };

return (
  <ScrollView style={styles.container}>
    <Text style={styles.title}>Airport<Text style={styles.wiki}>Wiki</Text></Text>
    <TextInput
      style={styles.input}
      placeholder="Enter FAA code (e.g., ATL)"
      value={airportCode}
      onChangeText={setAirportCode}
    />
    <Button title="Fetch Airport Info" onPress={fetchAirportData} />
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
});