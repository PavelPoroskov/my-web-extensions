import {
  updateActiveTab,
} from '../api/main-api.js'
// import {
//   log,
// } from '../api/debug.js'

export const runtimeController = {
  onStartup() {
    // log('runtime.onStartup');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    // log('runtime.onInstalled');
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  }
};
