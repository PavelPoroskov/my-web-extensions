import {
  logEvent,
} from '../api/debug.js'
import {
  memo,
} from '../api/memo.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'

export const windowsController = {
  async onFocusChanged(windowId) {
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      await memo.initMemo()
      updateActiveTab({
        useCache: true,
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
