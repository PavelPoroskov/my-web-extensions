import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const windowsController = {
  onFocusChanged() {
    log('windows.onFocusChanged');
    updateActiveTab({ useCache: true });
  },
};
