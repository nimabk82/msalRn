import {
  loadAzureConfig,
  storeAzureConfig,
  removeAzureConfig,
} from './oauthConfigStore';
import {authorize, refresh, revoke} from 'react-native-app-auth';

const redirectUri = __DEV__
  ? 'msauth://com.msalrn/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D'
  : 'msauth://com.msalrn.prod/sJVrS8VPITLtYmSGP41hJl839nI%3D';

const tenantId = 'bf475492-067f-4d6e-989f-776b97a19cd9';

const config = {
  issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  clientId: 'd5a97498-a9f0-4007-9f4a-d16592145e79',
  redirectUrl: redirectUri,
  scopes: ['user.read', 'openid', 'profile', 'email', 'offline_access'],
  additionalParameters: {
    prompt: 'select_account', // This prompts the user to select an account
  },
  // serviceConfiguration: {
  //   authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
  //   tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  // },
};
export default class Oauth {
  static async signInInteractively() {
    try {
      const newAuthState = await authorize({
        ...config,
        connectionTimeoutSeconds: 5,
        iosPrefersEphemeralSession: true,
      });
      console.log('Success to log in', newAuthState);
      await storeAzureConfig(newAuthState);

      return newAuthState.accessToken;
    } catch (error) {
      console.log('Failed to log in', error.message);
      return false;
    }
  }

  static needAzureTokenRefresh() {
    // Token was acquired?
    if (global.azureTokenExpirationDate) {
      // Token has expired?
      if (new Date().getTime() > global.azureTokenExpirationDate) {
        return true;
      }
      return false;
    }
    return true;
  }

  static async signInSilently() {
    if (!global.azureAccessToken) {
      await loadAzureConfig();
      if (!global.azureAccessToken) {
        console.log('signInSilently: No Azure account was acquired!');
        return false;
      }
    }

    try {
      const newAuthState = await refresh(config, {
        refreshToken: global?.refreshToken,
      });
      console.log('Success to refresh token', newAuthState);
      await storeAzureConfig(newAuthState);
      return newAuthState;
    } catch (error) {
      console.log('Failed to refresh token', error.message);
      return false;
    }
  }

  static async signOut() {
    if (!global.azureAccessToken) {
      await loadAzureConfig();
      if (!global.azureAccessToken) {
        console.log('signOut: No Azure account was acquired!');
        return false;
      }
    }

    try {
      const result = await revoke(config, {
        tokenToRevoke: global.azureAccessToken,
        sendClientId: true,
      });
      return result;
    } catch (error) {
      console.log('Failed to revoke token', error.message);
      return false;
    } finally {
      removeAzureConfig();
    }
  }
}
