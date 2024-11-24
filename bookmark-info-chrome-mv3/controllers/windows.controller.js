import {
  makeLogFunction,
} from '../api/log-api.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'

const logWC = makeLogFunction({ module: 'windows.controller' })

export const windowsController = {
  async onFocusChanged(windowId) {
    logWC('windows.onFocusChanged', windowId);
    
    if (0 < windowId) {
      logWC('windows.onFocusChanged', windowId);
      updateActiveTab({
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
