
import { USER_SETTINGS_DEFAULT_VALUE, USER_SETTINGS_OPTIONS } from '../constants.js';

export const readSettings = async () => {
  const savedSettings = await chrome.storage.local.get(
    Object.values(USER_SETTINGS_OPTIONS)
  );

  return {
    ...USER_SETTINGS_DEFAULT_VALUE,
    ...savedSettings,
  }
}

