import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomTabBar } from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
        initialRouteName="Home"
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
