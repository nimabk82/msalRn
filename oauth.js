import PublicClientApplication, {MSALConfiguration} from 'react-native-msal';
import MsalConfig from './android/app/src/main/res/raw/msal_config.json';
import {
  loadAzureConfig,
  storeAzureConfig,
  removeEventListener,
} from './oauthConfigStore';

const AZURE_CLIENT_ID = MsalConfig.client_id;
const redirectUri = __DEV__
  ? 'msauth://com.msalrn/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D'
  : 'msauth://com.msalrn.prod/sJVrS8VPITLtYmSGP41hJl839nI%3D';

const scope = `api://${AZURE_CLIENT_ID}/authorize`;
const pca = new PublicClientApplication(
  {
    auth: {
      clientId: MsalConfig.client_id,
      redirectUri,
      // authority: MsalConfig.redirect_uri,
    },
  },
  false,
);

export default class Oauth {
  static async signInInteractively() {
    const params = {
      scopes: [scope],
    };

    try {
      await pca.init();
      const result = await pca.acquireToken(params);
      await storeAzureConfig(result);

      console.log(`signInInteractively: ${JSON.stringify(result)}`);
      return 'result';
    } catch (error) {
      console.log(`signInInteractively: ${error}`);
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
    if (!global.azureAccount) {
      await loadAzureConfig();

      if (!global.azureAccount) {
        console.log('signInSilently: No Azure account was acquired!');
        return false;
      }
    }
    const params = {
      scopes: [scope],
      account: global.azureAccount,
      // forceRefresh: true,
    };

    try {
      await pca.init();
      const result = await pca.acquireTokenSilent(params);
      await storeAzureConfig(result);
      console.log(`signInSilently: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signInSilently`, error);
      return false;
    }
  }

  static async signOut() {
    if (!global.azureAccount) {
      await loadAzureConfig();

      if (!global.azureAccount) {
        console.log('signOut: No Azure account was acquired!');
        return false;
      }
    }

    const params = {
      account: global.azureAccount,
      signoutFromBrowser: true,
    };

    try {
      await pca.init();
      const result = await pca.signOut(params);
      console.log(`signOut: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signOut: ${error}`);
      return false;
    } finally {
      removeEventListener();
    }
  }
}
