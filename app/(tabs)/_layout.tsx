// import { Tabs, useRouter } from 'expo-router';
// import React, { useEffect } from 'react';
// import { Platform } from 'react-native';

// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides user & loading state

// export default function TabLayout({ children }: { children: React.ReactNode }) {
//   const colorScheme = useColorScheme();
//   const { user, loading } = useAuth(); 
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to login if no user is authenticated
//     if (!loading && !user) {
//       router.replace('/');
//     }
//   }, [loading, user]);

//   if (loading) {
//     return null; 
//   }

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarBackground: TabBarBackground,
//         tabBarStyle: Platform.select({
//           ios: {
//             // Use a transparent background on iOS to show the blur effect
//             position: 'absolute',
//           },
//           default: {},
//         }),
//       }}
//     >

//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
//         }}
//       />
//         <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
//         }}
//       />

//     </Tabs>
//   );
// }

// import { Tabs, useRouter } from 'expo-router';
// import React, { useEffect } from 'react';
// import { Platform } from 'react-native';

// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides user & loading state

// export default function TabLayout({ children }: { children: React.ReactNode }) {
//   const colorScheme = useColorScheme();
//   const { user, loading } = useAuth(); 
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to login if no user is authenticated
//     if (!loading && !user) {
//       router.replace('/');
//     }
//   }, [loading, user]);

//   if (loading) {
//     return null; 
//   }

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarBackground: TabBarBackground,
//         tabBarStyle: Platform.select({
//           ios: {
//             // Use a transparent background on iOS to show the blur effect
//             position: 'absolute',
//           },
//           default: {},
//         }),
//       }}
//     >
//       {/* Home Screen on the Left */}
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="house.fill" color={color} />
//           ),
//         }}
//       />
//       {/* Home Screen on the Left */}
//       <Tabs.Screen
//         name="explore2"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="house.fill" color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook provides user & loading state
import { MaterialIcons } from '@expo/vector-icons';


export default function TabLayout({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if no user is authenticated
    if (!loading && !user) {
      router.replace('/');
    }
  }, [loading, user]);

  if (loading) {
    return null; 
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {/* Home Screen on the Left */}
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            // <IconSymbol size={28} name="house.fill" color={color} />
            <MaterialIcons name="home" size={28} color={color} />
          ),
        }}
      />
      {/* Profile Screen on the Right */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
