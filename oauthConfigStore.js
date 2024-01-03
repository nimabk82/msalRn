import AsyncStorage from '@react-native-async-storage/async-storage';

const AzureOAUTHStorageKey = 'azureOAUTH';

export async function storeAzureConfig(result) {
  // Store account needed for token refresh and signOut
  global.azureAccount = result.account;
  global.azureAccessToken = result.accessToken;
  global.azureTokenExpirationDate = result.expiresOn * 1000;

  // Store it also in the device storage
  const azureOAUTH = {
    account: result.account,
    accessToken: result.accessToken,
    expirationDate: global.azureTokenExpirationDate,
  };

  await AsyncStorage.setItem(AzureOAUTHStorageKey, JSON.stringify(azureOAUTH));
}

export async function loadAzureConfig() {
  if (!global.azureAccessToken) {
    // Azure config was already stored?
    try {
      const result = await AsyncStorage.getItem(AzureOAUTHStorageKey);
      if (result) {
        const azureOAUTH = JSON.parse(result);
        global.azureAccount = azureOAUTH.account;
        global.azureAccessToken = azureOAUTH.accessToken;
        global.azureTokenExpirationDate = azureOAUTH.expirationDate;

        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }
  return true;
}

export async function removeAzureConfig() {
  global.azureAccount = null;
  global.azureAccessToken = null;
  global.azureTokenExpirationDate = null;

  await AsyncStorage.removeItem(AzureOAUTHStorageKey);
}
