import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const WindowsController = {
  onFocusChanged: () => {
    log('windows.onFocusChanged');
    updateActiveTab({ useCache: true });
  }
};
