import PublicClientApplication, {MSALConfiguration} from 'react-native-msal';
import MsalConfig from './android/app/src/main/assets/msal_config.json';
import {
  loadAzureConfig,
  storeAzureConfig,
  removeAzureConfig,
} from './oauthConfigStore';

const allowedUsers = ['nbokaei1982@hotmail.com'];

const AZURE_CLIENT_ID = MsalConfig.client_id;
const redirectUri = __DEV__
  ? 'msauth://com.msalrn/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D'
  : 'msauth://com.msalrn.prod/sJVrS8VPITLtYmSGP41hJl839nI%3D';

// const scope = ['authorize'];
// const url =`api://${AZURE_CLIENT_ID}/`;
// const scope = [`${url}user.read`,`${url}openid`,`${url}profile`,`${url}offline_access`];
const authorize = ['api://d5a97498-a9f0-4007-9f4a-d16592145e79/authorize'];
const scope = ['user.read'];

console.log(redirectUri);
const pca = new PublicClientApplication({
  auth: {
    clientId: MsalConfig.client_id,
    redirectUri,
    // authority: MsalConfig.redirect_uri,
  },
});

export default class Oauth {
  static async signInInteractively() {
    const params = {
      scopes: scope,
    };

    try {
      await pca.init();
      const result = await pca.acquireToken(params);

      // if (result && allowedUsers.includes(result.account.username)) {
      console.log('Access granted', result);
      await storeAzureConfig(result);

      console.log(`signInInteractively: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signInInteractively: ${error}`);
      // alert(`${error.message}`);

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
      scopes: scope,
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

    console.log(global.azureAccount, 'here');

    try {
      await pca.init();
      const result = await pca.signOut(params);
      // removeAzureConfig();
      console.log(`signOut: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.log(`signOut: ${error}`);
      return false;
    } finally {
      removeAzureConfig();
    }
  }
}
