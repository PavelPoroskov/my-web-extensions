import {
  getBookmarkInfoUni,
  updateActiveTab,
} from '../api/main-api.js'
import {
  log,
} from '../api/debug.js'

export const bookmarksController = {
  async onCreated(_, node) {
    // log('bookmark.onCreated');

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    log('bookmark.onChanged 00', changeInfo);
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    log('bookmark.onChanged 11', bookmark);
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onMoved(bookmarkId) {
    // log('bookmark.onMoved');
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    const [bookmark] = await chrome.bookmarks.get(bookmarkId)
    // log('bookmark.onMoved', bookmark);
    getBookmarkInfoUni({ url: bookmark.url });
  },
  async onRemoved(_, { node }) {
    // log('bookmark.onRemoved');
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}