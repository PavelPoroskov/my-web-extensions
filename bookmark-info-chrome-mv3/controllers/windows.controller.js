import {
  logEvent,
} from '../api/debug.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'

export const windowsController = {
  async onFocusChanged(windowId) {
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      updateActiveTab({
        useCache: true,
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
