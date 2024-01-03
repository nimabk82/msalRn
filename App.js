import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// import jwt_decode from 'jwt-decode';
import Oauth from './oauth';
import {loadAzureConfig, removeAzureConfig} from './oauthConfigStore';
import {WebView} from 'react-native-webview';

// let pca;
// let clientID = 'd5a97498-a9f0-4007-9f4a-d16592145e79';
// let tenantID = 'bf475492-067f-4d6e-989f-776b97a19cd9';
// let config = {
//   auth: {
//     clientId: clientID,
//     authority: `https://login.microsoftonline.com/${tenantID}/v2.0`,
//     redirectUri: 'msauth://com.msalrn/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D',
//   },
// };

// {
//   "client_id": "d5a97498-a9f0-4007-9f4a-d16592145e79",
//   "authorization_user_agent": "DEFAULT",
//   "redirect_uri": "msauth://com.sehc.fls/VzSiQcXRmi2kyjzcA%2BmYLEtbGVs%3D",
//   "authorities": [
//     {
//       "type": "AAD",
//       "audience": {
//         "type": "AzureADMyOrg",
//         "tenant_id": "bf475492-067f-4d6e-989f-776b97a19cd9"
//       }
//     }
//   ],
//   "account_mode": "MULTIPLE"
// }

const App = () => {
  const [loading, setLoading] = React.useState(false);
  const [isLogeddin, setIsLogeddin] = React.useState(false);

  const injectedJavaScript = `
    (function() {
      window.localStorage.setItem('access_token', '${global.azureAccessToken}');
    })();
  `;

  const extLink =
    'https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=19&ct=1704259846&rver=7.0.6738.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fstate%3d1%26redirectTo%3daHR0cHM6Ly9vdXRsb29rLmxpdmUuY29tL21haWwv%26RpsCsrfState%3d63379789-a0df-d2b7-0037-96a68470633d&id=292841&aadredir=0&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015&login_hint=nbokaei1982%40hotmail.com&username=nbokaei1982%40hotmail.com';

  React.useEffect(() => {
    const init = async () => {
      if (await loadAzureConfig()) {
        setIsLogeddin(true);
      }
    };

    init();
  }, []);

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
          alert('success1');
        } else {
          alert('success2');

          setLoading(false);
        }
        alert('success3');

        setLoading(false);
      } else {
        // Navigate to the main page
        alert('success4');
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
          alert('success6');

          setLoading(false);
        }
      });
    }
  };

  const pressLink = () => {
    Linking.openURL('https://login.live.com/');
  };

  console.log(global.azureAccount);
  if (loading) {
    return (
      <View>
        <Text>loading</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{}}>
      <View>
        {isLogeddin ? (
          <>
            <Text>Loggedin</Text>
            <Text>{global.azureAccessToken}</Text>
            <Pressable
              onPress={() => {
                removeAzureConfig();
                setIsLogeddin(false);
              }}>
              <Text>Remove</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={handleSignIn}>
            <Text>Sign in</Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={pressLink}>
        <Text>Open link</Text>
      </Pressable>
      <View style={{width: '100%', height: '100%'}}>
        {/* <WebView
          source={{
            uri: extLink,
          }}
          style={{flex: 1}}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={event => {
            if (event.url !== extLink) {
              alert(event.url);

              // Handle any redirects or navigation changes here if necessary
            }
          }}
        /> */}
      </View>
    </SafeAreaView>
  );
};

export default App;
