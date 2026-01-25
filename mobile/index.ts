import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';

// Disable native screens to fix casting error on Android
enableScreens(false);

import App from './App';

registerRootComponent(App);
