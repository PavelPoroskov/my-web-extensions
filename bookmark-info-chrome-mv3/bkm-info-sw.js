import { BkmsController } from './src/controllers/bkms-controller.js';
import { TabsController } from './src/controllers/tabs-controller.js';
import { WindowsController } from './src/controllers/windows-controller.js';

import { updateActiveTab } from './src/main-api.js';

chrome.runtime.onInstalled.addListener(async function () {
  chrome.bookmarks.onCreated.addListener(BkmsController.onCreated);
  chrome.bookmarks.onMoved.addListener(BkmsController.onMoved);
  chrome.bookmarks.onChanged.addListener(BkmsController.onChanged);
  chrome.bookmarks.onRemoved.addListener(BkmsController.onRemoved);
  
  chrome.tabs.onCreated.addListener(TabsController.onCreated);
  chrome.tabs.onUpdated.addListener(TabsController.onUpdated);
  // listen for tab switching
  chrome.tabs.onActivated.addListener(TabsController.onActivated);
  
  // listen for window switching
  // chrome.windows.onFocusChanged.addListener(WindowsController.onFocusChanged);
  
  updateActiveTab();  
});