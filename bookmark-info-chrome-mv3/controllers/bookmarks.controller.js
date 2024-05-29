import {
  logEvent,
  logSendEvent,
} from '../api/debug.js'
import {
  memo,
} from '../api/memo.js'
import {
  getUrlInfo,
} from '../api/url-info-api.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  removeQueryParamsIfTarget,
} from '../api/link-api.js'
import {
  USER_SETTINGS_OPTIONS,
} from '../constants.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (!node.url) {
      return
    }
  
    logEvent('bookmark.onCreated <-');

    if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const cleanUrl = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });
        if (bookmarkList.length === 0) {
          // if first time then we fix url in new bookmark
          await chrome.bookmarks.update(
            bookmarkId,
            { url: cleanUrl }
          )
        } else {
          // if second time then we delete new bookmark
          //
          // TODO sometimes we want create two+ bookmark for the same url in different folders
          //  when we create bookmark from fixed tags: we will use addBookmark(cleanurl, path)
          await chrome.bookmarks.remove(bookmarkId)  
        }

        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;

        if (activeTab?.id) {
          const msg = {
            command: "changeLocationToCleanUrl",
            cleanUrl,
          }
          logSendEvent('bookmarksController.onCreated()', activeTab.id, msg)
          await chrome.tabs.sendMessage(activeTab.id, msg)
        }
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getUrlInfo({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    getUrlInfo({ url: bookmark.url });        
  },
  async onMoved(bookmarkId) {
    logEvent('bookmark.onMoved <-');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    getUrlInfo({ url: bookmark.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getUrlInfo({ url: node?.url });
  },
}