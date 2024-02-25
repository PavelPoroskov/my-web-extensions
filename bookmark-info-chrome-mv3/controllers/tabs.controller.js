import {
  getBookmarkInfoUni,
  isSupportedProtocol,
  updateBookmarkInfoInPage,
} from '../api/main-api.js'
import {
  cacheTabToInfo,
} from '../api/cache.js'
import {
  log,
} from '../api/debug.js'

export const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    log('tabs.onCreated', index, id, url);
    if (url && isSupportedProtocol(url)) {
      getBookmarkInfoUni({ url, useCache: true });
    }
  },
  async onUpdated(tabId, changeInfo, Tab) {
    log('tabs.onUpdated', Tab.index, tabId, changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading'): {
        cacheTabToInfo.delete(tabId);
        const url = changeInfo?.url;
  
        if (url && isSupportedProtocol(url)) {
          log('tabs.onUpdated LOADING', tabId, url);
          getBookmarkInfoUni({ url, useCache: true });  
        }
        break;
      }
      case (changeInfo?.status == 'complete' && Tab.url && isSupportedProtocol(Tab.url)): {
        const url = Tab.url;
        log('tabs.onUpdated COMPLETE', tabId, url);
        const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
        updateBookmarkInfoInPage({
          tabId,
          bookmarkInfo,
        })
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    log('tabs.onActivated tabId', tabId);
    const Tab = await chrome.tabs.get(tabId);
    const url = Tab.url;
    
    if (isSupportedProtocol(url)) {
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
      updateBookmarkInfoInPage({
        tabId,
        bookmarkInfo,
      })
    }
  },
}