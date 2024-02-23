import {
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const runtimeController = {
  onStartup() {
    log('runtime.onStartup');
    updateActiveTab();
  },
  onInstalled () {
    log('runtime.onInstalled');
    updateActiveTab();
  }
};
