import {
  getBookmarkInfoUni,
  updateActiveTab,
} from '../api/main-api.js'
import {
  logEvent,
} from '../api/debug.js'

export const bookmarksController = {
  async onCreated(_, node) {
    logEvent('bookmark.onCreated');

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00', changeInfo);
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
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(_, { node }) {
    logEvent('bookmark.onRemoved');
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}