import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  logEvent,
} from '../api/debug.js'

export const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  }
};
