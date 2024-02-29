import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const windowsController = {
  onFocusChanged(windowId) {
    if (0 < windowId) {
      log('windows.onFocusChanged', windowId);
      updateActiveTab({ useCache: true });
    }
  },
};
