import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  logEvent,
} from '../api/debug.js'

export const windowsController = {
  onFocusChanged(windowId) {
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      updateActiveTab({
        useCache: true,
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
