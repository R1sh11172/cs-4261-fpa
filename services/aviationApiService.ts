import axios from 'axios';
import { AirportInfo } from '../types'; // Adjust the path as needed

const BASE_URL = 'https://api.aviationapi.com/v1';

export const getAirportInfo = async (apt: string): Promise<Record<string, AirportInfo>> => {
  try {
    const response = await axios.get(`${BASE_URL}/airports`, {
      params: { apt },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching airport information:', error);
    throw error;
  }
};

export const getAirportCharts = async (apt: string): Promise<Record<string, AirportInfo>> => {
  try {
    const response = await axios.get(`${BASE_URL}/charts`, {
      params: { apt },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching airport charts:', error);
    throw error;
  }
};

export const getWeather = async (apt: string) => {
  try {
    const response = await axios.get(`https://aviationweather.gov/api/data/metar`, {
      params: { 
        ids: apt,
        format: 'json',
        taf: 'false',
        house: 1
       },
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};