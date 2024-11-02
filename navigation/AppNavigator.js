import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";

import LoginScreen from "../Screens/LoginScreen";
import SignupScreen from "../Screens/SignupScreen";
import HomeScreen from "../Screens/HomeScreen";
import AddExpenseScreen from "../Screens/AddExpenseScreen";
import ExpenseHistoryScreen from "../Screens/ExpenseHistoryScreen";
import CustomDrawerContent from "../Screens/CustomDrawerContent";

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator initialRouteName="Home">
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: "Home",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{
        tabBarLabel: "Add Expense",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-box" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="ExpenseHistory"
      component={ExpenseHistoryScreen}
      options={{
        tabBarLabel: "History",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="history" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Drawer Navigator wrapping Main Tabs
const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false, // Hide the header as we have a custom drawer
    }}
  >
    <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
  </Drawer.Navigator>
);

// Authentication Stack for Login and Signup
const AuthStackNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <AuthStack.Screen
      name="Signup"
      component={SignupScreen}
      options={{ headerShown: false }}
    />
  </AuthStack.Navigator>
);

// Root Stack with Conditional Rendering
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for authentication changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe; // Clean up listener on unmount
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="MainDrawer" component={DrawerNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
