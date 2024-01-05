import * as React from 'react';
import {Linking, Pressable} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, View, Button} from 'react-native';
import {loadAzureConfig, removeAzureConfig} from './oauthConfigStore';
import Oauth from './oauth';

function HomeScreen({navigation, setIsLogeddin}) {
  const pressLink = () => {
    Linking.openURL('https://login.live.com/');
  };

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <View style={{marginTop: 20}}>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile', {username: 'johndoe'})}
        />
      </View>
      <View style={{marginTop: 20}}>
        <Button
          title="Logout"
          onPress={() => {
            removeAzureConfig();
            setIsLogeddin(false);
          }}
        />
      </View>
      <View style={{marginTop: 20}}>
        <Button title="Press Link" onPress={pressLink} />
      </View>
    </View>
  );
}

function LoginScreen({navigation, setIsLogeddin, isLogeddin}) {
  const [loading, setLoading] = React.useState(false);

  // React.useEffect(() => {
  //   if (!isLogeddin) {
  //     handleSignIn();
  //   }
  // }, [isLogeddin]);

  const handleSignIn = async () => {
    // Access token will be saved into global.azureAccessToken variable
    // and added to Request header in axios Request interceptor,
    // implemented in /index.js
    if (await loadAzureConfig()) {
      setLoading(true);

      if (Oauth.needAzureTokenRefresh()) {
        setLoading(true);
        if (await Oauth.signInSilently()) {
          // await callLoginApi();
          setIsLogeddin(true);
          // alert('success1');
        } else {
          // alert('success2');

          setLoading(false);
        }
        // alert('success3');

        setLoading(false);
      } else {
        // Navigate to the main page
        // alert('success4');
        setIsLogeddin(true);

        setLoading(false);
        // dispatch(login());
      }
    } else {
      // The Azure token wasn't retrieved yet, so
      // an interactive login will needed if internet is active

      setTimeout(async () => {
        setLoading(true);
        if (await Oauth.signInInteractively()) {
          setLoading(false);
          setIsLogeddin(true);

          // await callLoginApi();
        } else {
          // alert('success6');

          setLoading(false);
        }
      });
    }
  };
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Login Screen</Text>
      <Pressable onPress={handleSignIn}>
        <Text>Sign in</Text>
      </Pressable>
    </View>
  );
}

function TestScreen({route}) {
  const username = route.params?.username ?? 'No username provided';

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Test Screen</Text>
      <Text>{username}</Text>
    </View>
  );
}

// function ProfileScreen({route}) {
//   const username = route.params?.username ?? 'No username provided';

//   return (
//     <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//       <Text>Profile Screen</Text>
//       <Text>{username}</Text>
//     </View>
//   );
// }

const Stack = createStackNavigator();

const linking = {
  // Prefixes accepted by the navigation container, should match the added schemes
  prefixes: [
    // 'myapp://',
    'https://purple-water-0475ec410.4.azurestaticapps.net/',
    //  +
    //   global.azureAccessToken,
  ],
  // Route config to map uri paths to screens
  config: {
    // Initial route name to be added to the stack before any further navigation,
    // should match one of the available screens
    initialRouteName: 'Home',
    screens: {
      // myapp://home -> HomeScreen
      Home: 'home',
      // myapp://details/1 -> DetailsScreen with param id: 1
      Details: 'details/:id',
      Test: 'test/:username',
      Login: 'login',
    },
  },
};

export default function App() {
  const [isLogeddin, setIsLogeddin] = React.useState(false);

  React.useEffect(() => {
    const aa = () => {
      Linking.getInitialURL().then(ev => {
        alert(ev);
      });
    };
    Linking.addEventListener('url', aa);
    return () => Linking.removeAllListeners('url');
  }, []);

  React.useEffect(() => {
    const init = async () => {
      if (await loadAzureConfig()) {
        setIsLogeddin(true);
      }
    };

    init();
  }, [isLogeddin]);

  console.log(linking);
  return (
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      {isLogeddin ? (
        <Stack.Navigator>
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} setIsLogeddin={setIsLogeddin} />}
          </Stack.Screen>
          <Stack.Screen
            name="Test"
            component={TestScreen}
            options={({route}) => ({
              title: route.params?.username ?? 'Test',
            })}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login">
            {props => (
              <LoginScreen
                {...props}
                setIsLogeddin={setIsLogeddin}
                isLogeddin={isLogeddin}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
