import {
  logEvent,
} from '../api/debug.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  MENU,
} from '../constants.js'

function createContextMenu() {
  chrome.contextMenus.create({
    id: MENU.CLOSE_DUPLICATE,
    // firefox can
    // contexts: ['page', 'tab'],
    contexts: ['page'],
    title: 'close duplicate tabs',
  });
  // TODO? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  chrome.contextMenus.create({
    id: MENU.CLOSE_BOOKMARKED,
    contexts: ['page'],
    title: 'close bookmarked tabs',
  });
  // TODO? bookmark and close tabs (tabs without bookmarks)
}

export const runtimeController = {
  onStartup() {
    logEvent('runtime.onStartup');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  }
};
