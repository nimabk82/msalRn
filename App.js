import * as React from 'react';
import {Linking, Pressable} from 'react-native';
import {
  authorize,
  refresh,
  revoke,
  prefetchConfiguration,
} from 'react-native-app-auth';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, View, Button} from 'react-native';
import {loadAzureConfig, removeAzureConfig} from './oauthConfigStore';
import Oauth from './oauth';
import Config from 'react-native-config';

function HomeScreen({navigation, setIsLogeddin}) {
  const {apiBaseUrl} = Config;

  const pressLink = hasToekn => {
    // alert(apiBaseUrl);
    // Linking.openURL('https://login.live.com/');

    // if (hasToekn) {
    //   Linking.openURL(
    //     `https://proud-forest-0106ba110.4.azurestaticapps.net/test?token=${global.azureAccessToken}`,
    //   );
    //   return;
    // }
    Linking.openURL(
      `https://purple-water-0475ec410.4.azurestaticapps.net/clientDetails/isDeeplinking/false/clientId/undefined/dob/1989%2F06%2F14/firstName/Nickolodium/lastName/Christopoplopolis`,
    );
    // Linking.openURL(
    //   `http://192.168.4.23:3002/clientDetails/isDeeplinking/false/clientId/undefined/dob/1989%2F06%2F14/firstName/Nickolodium/lastName/Christopoplopolis`,
    // );
    // https://login.microsoftonline.com/bf475492-067f-4d6e-989f-776b97a19cd9/oauth2/v2.0/authorize?client_id=d5a97498-a9f0-4007-9f4a-d16592145e79&scope=user.read%20openid%20profile%20offline_access&redirect_uri=https%3A%2F%2Fpurple-water-0475ec410.4.azurestaticapps.net%2F&client-request-id=faff24d2-91c9-46d6-b17a-a0904de40f0f&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.38.3&client_info=1&code_challenge=Vs7jCfD5_PAnYzRDW_j6ko1PzTWWZa_Ar1gXwXuWIrU&code_challenge_method=S256&nonce=cc9681ac-5f97-4fd8-8e46-54e7128a5080&state=eyJpZCI6IjM1NzNjNDEzLTg3NDItNDNjNi1iNGJlLTE2Zjg3MTJmN2U0MyIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D&claims=%7B%22access_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D

    // Linking.openURL(`https://login.live.com/`);
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
            Oauth.signOut();
            // removeAzureConfig();
            setIsLogeddin(false);
          }}
        />
      </View>
      <View style={{marginTop: 20}}>
        <Button title="Link to web" onPress={() => pressLink(false)} />
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
      console.log('global.azureAccount');

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

function ProfileScreen({route}) {
  const username = route.params?.username ?? 'No username provided';

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Profile Screen</Text>
      <Text>{username}</Text>
    </View>
  );
}

const Stack = createStackNavigator();

const linking = {
  // Prefixes accepted by the navigation container, should match the added schemes
  prefixes: [
    // 'myapp://',
    'https://purple-water-0475ec410.4.azurestaticapps.net/mobile/',
    'https://msal-react-demo.vercel.app/mobile/',
  ],
  // Route config to map uri paths to screens
  config: {
    // Initial route name to be added to the stack before any further navigation,
    // should match one of the available screens
    initialRouteName: 'Home',
    screens: {
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

  // const {apiBaseUrl} = Config;

  React.useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        const url = new URL(initialUrl);

        // Check if the URL fragment contains the authorization code
        // const authorizationCode = url.hash.replace('#code=', '');

        // alert(authorizationCode);
        Linking.openURL(initialUrl);
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    return () => Linking.removeAllListeners('url');
  }, []);

  React.useEffect(() => {
    const init = async () => {
      if (await loadAzureConfig()) {
        setIsLogeddin(true);
      }
    };

    init();
  }, []);

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
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({route}) => ({
              title: route.params?.username ?? 'Profile',
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
