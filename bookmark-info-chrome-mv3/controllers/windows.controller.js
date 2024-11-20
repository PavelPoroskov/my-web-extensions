import {
  logEvent,
  logDebug,
} from '../api/log-api.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'

export const windowsController = {
  async onFocusChanged(windowId) {
    logDebug('windows.onFocusChanged', windowId);
    
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      updateActiveTab({
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
