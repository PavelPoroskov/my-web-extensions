import {
  updateActiveTab,
} from '../main-api.js'
import {
  log,
} from '../utils.js'

export const WindowsController = {
  onFocusChanged: () => {
    log('windows.onFocusChanged');
    updateActiveTab({ useCache: true });
  }
};
