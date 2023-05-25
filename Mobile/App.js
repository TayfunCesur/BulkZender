import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, } from '@react-navigation/native-stack';
import { TransitionPresets } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ReceipentScreen from './screens/ReceipentScreen';
import BasketScreen from './screens/BasketScreen';
import { store } from './store'
import { Provider } from 'react-redux'
import { LogBox } from 'react-native';
const Stack = createNativeStackNavigator();

LogBox.ignoreLogs(['`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method',
  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method']);
export default function App() {
  const SlideTransition = {
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
            {
              translateX: next
                ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -layouts.screen.width],
                })
                : 1,
            },
          ],
        },
      };
    },
  };

  return (
    <NavigationContainer>
      <Provider store={store}>
        <Stack.Navigator initialRouteName="Home"
          screenOptions={({ route, navigation }) => ({
            headerShown: false,
            gestureEnabled: true,
          })}>
          <Stack.Screen name="Home" component={HomeScreen} options={{
            presentation: 'modal',
            animationTypeForReplace: 'push',
            animation: 'slide_from_right'
          }} />
          <Stack.Screen name="Receipent" component={ReceipentScreen} options={{
            presentation: 'modal',
            animationTypeForReplace: 'push',
            animation: 'slide_from_right'
          }} />
          <Stack.Screen name="Basket" component={BasketScreen} options={{
            presentation: 'modal',
            animationTypeForReplace: 'push',
            animation: 'slide_from_right'
          }} />
        </Stack.Navigator>
      </Provider>
    </NavigationContainer>
  );
}
