import {
  logEvent,
  logSendEvent,
} from '../api/debug.js'
import {
  memo,
} from '../api/memo.js'
import {
  getBookmarkInfoUni,
} from '../api/bookmarks-api.js'
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

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const cleanUrl = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });
        const isExist = bookmarkList.some(({ parentId }) => parentId === node.parentId)

        if (!isExist) {
          await chrome.bookmarks.create({
            parentId: node.parentId,
            title: node.title,
            url: cleanUrl
          })
          memo.notCleanUrlBookmarkSet.add(node.url)
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
  
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);


    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    const [bookmark] = await chrome.bookmarks.get(bookmarkId)

    if (changeInfo.title && bookmark.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const cleanUrl = removeQueryParamsIfTarget(bookmark.url);
      
      if (bookmark.url !== cleanUrl) {
        const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });

        await Promise.all(bookmarkList.map(
          bItem => chrome.bookmarks.update(bItem.id, { title: changeInfo.title })
        ))
        memo.notCleanUrlBookmarkSet.add(bookmark.url)
      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: bookmark.url });        
  },
  async onMoved(bookmarkId, { oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    const [bookmark] = await chrome.bookmarks.get(bookmarkId)

    if ((oldParentId || parentId) && bookmark.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const cleanUrl = removeQueryParamsIfTarget(bookmark.url);
      
      if (bookmark.url !== cleanUrl) {
        const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });
        const cleanBkmWithOldParentId = bookmarkList.filter(({ parentId }) => parentId === oldParentId)

        await Promise.all(cleanBkmWithOldParentId.map(
          bItem => chrome.bookmarks.move(bItem.id, { parentId })
        ))
        memo.notCleanUrlBookmarkSet.add(bookmark.url)
      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}