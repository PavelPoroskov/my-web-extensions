import {
  logEvent,
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
  cleanLink,
} from '../api/link-api.js'
import {
  USER_SETTINGS_OPTIONS,
} from '../constants.js'

export const bookmarksController = {
  async onCreated(id, node) {
    logEvent('bookmark.onCreated');

    if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS] && node.url) {
      const cleanedUrl = cleanLink(node.url);
      
      if (node.url !== cleanedUrl) {
        await chrome.bookmarks.update(
          id,
          { url: cleanedUrl }
        )
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00', changeInfo);
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onMoved(bookmarkId) {
    logEvent('bookmark.onMoved');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved');
    memo.bkmFolderById.delete(bookmarkId);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}