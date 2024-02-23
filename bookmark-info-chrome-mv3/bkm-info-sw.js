import { bookmarksController } from './controllers/bookmarks.controller.js';
import { tabsController } from './controllers/tabs.controller.js';
import { windowsController } from './controllers/windows.controller.js';
import { runtimeController } from './controllers/runtime.controller.js';
import { log } from './api/debug.js';

log('bkm-info-sw.js 00');

chrome.bookmarks.onCreated.addListener(bookmarksController.onCreated);
chrome.bookmarks.onMoved.addListener(bookmarksController.onMoved);
chrome.bookmarks.onChanged.addListener(bookmarksController.onChanged);
chrome.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

chrome.tabs.onCreated.addListener(tabsController.onCreated);
chrome.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
chrome.tabs.onActivated.addListener(tabsController.onActivated);

// listen for window switching
chrome.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

chrome.runtime.onStartup.addListener(runtimeController.onStartup)
chrome.runtime.onInstalled.addListener(runtimeController.onInstalled);