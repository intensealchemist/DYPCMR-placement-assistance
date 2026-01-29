import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { loadUser } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import JobsFeedScreen from '../screens/jobs/JobsFeedScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ResumeBuilderScreen from '../screens/profile/ResumeBuilderScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminApplicationsScreen from '../screens/admin/AdminApplicationsScreen';
import AdminJobsScreen from '../screens/admin/AdminJobsScreen';
import AdminJobFormScreen from '../screens/admin/AdminJobFormScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = route.name === 'Jobs'
            ? focused
              ? 'briefcase'
              : 'briefcase-outline'
            : focused
              ? 'person'
              : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Jobs" component={JobsFeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        // Crucial fix for "String cannot be cast to Boolean"
        detachPreviousScreen: false, 
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
         // Crucial fix for "String cannot be cast to Boolean"
        detachPreviousScreen: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="JobDetail" 
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="ResumeBuilder"
        component={ResumeBuilderScreen}
        options={{ title: 'Resume Builder' }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="AdminJobs" 
        component={AdminJobsScreen}
        options={{ title: 'Manage Jobs' }}
      />
      <Stack.Screen 
        name="AdminJobForm" 
        component={AdminJobFormScreen}
        options={{ title: 'Job Editor' }}
      />
      <Stack.Screen 
        name="AdminApplications" 
        component={AdminApplicationsScreen}
        options={{ title: 'All Applications' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await dispatch(loadUser()).unwrap();
      } catch (error) {
        // User not logged in
      } finally {
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
