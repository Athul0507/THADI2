import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import NewEntryScreen from '../screens/NewEntryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type MainTabParamList = {
  Pulse: undefined;
  Record: undefined;
  Studio: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.stroke,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontFamily: theme.fonts.body, fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'ellipse';
          if (route.name === 'Pulse') icon = 'pulse';
          if (route.name === 'Record') icon = 'radio-button-on';
          if (route.name === 'Studio') icon = 'settings-sharp';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pulse" component={HomeScreen} />
      <Tab.Screen name="Record" component={NewEntryScreen} />
      <Tab.Screen name="Studio" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
