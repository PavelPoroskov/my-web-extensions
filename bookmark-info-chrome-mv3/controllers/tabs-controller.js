import {
  getBookmarkInfoUni,
  isSupportedProtocol,
  updateBookmarkInfoInPage,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const TabsController = {
  onCreated: ({ pendingUrl: url }) => {
    log('tabs.onCreated pendingUrl', url);
    if (url && isSupportedProtocol(url)) {
      getBookmarkInfoUni({ url, useCache: true });
    }
  },
  onUpdated: async (tabId, changeInfo, Tab) => {
    // log('tabs.onUpdated 00', changeInfo);
    switch (true) {
      case (changeInfo?.status == 'loading' && changeInfo?.url && isSupportedProtocol(changeInfo.url)): {
        const url = changeInfo?.url;
        log('tabs.onUpdated11 tabId, status, url', tabId, changeInfo?.status, url);
        getBookmarkInfoUni({ url, useCache: true });
        break;
      };
      case (changeInfo?.status == 'complete' && Tab.url && isSupportedProtocol(Tab.url)): {
        const url = Tab.url;
        log('tabs.onUpdated22 tabId, status, Tab.url', tabId, changeInfo?.status, url);
        const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
        updateBookmarkInfoInPage({
          tabId,
          folderName: bookmarkInfo?.folderName,
        })
        break;
      };
    }
  },
  onActivated: async ({ tabId }) => {
    log('tabs.onActivated tabId', tabId);
    const Tab = await chrome.tabs.get(tabId);
    const url = Tab.url;
    
    if (isSupportedProtocol(url)) {
      const bookmarkInfo = await getBookmarkInfoUni({ url, useCache: true });
      updateBookmarkInfoInPage({
        tabId,
        folderName: bookmarkInfo?.folderName,
      })
    }
  },
}