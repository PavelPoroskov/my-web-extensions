import {
  makeLogFunction,
} from '../api/log-api.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  setFirstActiveTab,
} from '../api/init-extension.js'

const logWC = makeLogFunction({ module: 'windows.controller' })

export const windowsController = {
  async onFocusChanged(windowId) {
    logWC('windows.onFocusChanged', windowId);
    
    if (0 < windowId) {
      logWC('windows.onFocusChanged', windowId);
      await setFirstActiveTab({ debugCaller: 'windows.onFocusChanged' })
      updateActiveTab({
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
