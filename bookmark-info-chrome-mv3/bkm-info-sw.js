import { BkmsController } from './controllers/bkms-controller.js';
import { TabsController } from './controllers/tabs-controller.js';
import { WindowsController } from './controllers/windows-controller.js';

import { updateActiveTab } from './api/main-api.js';
import { log } from './api/debug.js';

// log('bkm-info-sw.js 00');

async function onInstalled() {
  // log('bkm-info-sw.js 11 onInstalled');
  chrome.bookmarks.onCreated.addListener(BkmsController.onCreated);
  chrome.bookmarks.onMoved.addListener(BkmsController.onMoved);
  chrome.bookmarks.onChanged.addListener(BkmsController.onChanged);
  chrome.bookmarks.onRemoved.addListener(BkmsController.onRemoved);
  
  chrome.tabs.onCreated.addListener(TabsController.onCreated);
  chrome.tabs.onUpdated.addListener(TabsController.onUpdated);
  // listen for tab switching
  chrome.tabs.onActivated.addListener(TabsController.onActivated);

  // listen for window switching
  chrome.windows.onFocusChanged.addListener(WindowsController.onFocusChanged);
  
  updateActiveTab();  
  // log('bkm-info-sw.js 22 onInstalled');
}

const makeOnceRun = (fn) => {
  let started = false;

  return () => {
    if (!started) {
      fn();
      started = true
    }
  }
}

const onInstalledOnce = makeOnceRun(onInstalled);

chrome.runtime.onStartup.addListener(() => {
  log('bkm-info-sw.js onStartup');
  onInstalledOnce();
})
chrome.runtime.onInstalled.addListener(() => {
  log('bkm-info-sw.js onInstalled');
  onInstalledOnce();
});