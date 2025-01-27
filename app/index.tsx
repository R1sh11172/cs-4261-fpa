import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { register, login } from '../services/authService';
import { useNavigation, useRouter } from 'expo-router';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const router = useRouter(); 

  const handleRegister = async () => {
    try {
      const user = await register(email, password);
      Alert.alert('Success', `User registered: ${user.email}`);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      Alert.alert('Success', `Welcome back: ${user.email}`);
      router.replace('/(tabs)/Home'); // Redirect to Home (tabs layout)
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLogin ? 'Login' : 'Register'} onPress={isLogin ? handleLogin : handleRegister} />
      <Button
        title={`Switch to ${isLogin ? 'Register' : 'Login'}`}
        onPress={() => setIsLogin(!isLogin)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
