import {
  logEvent,
  logDebug,
} from '../api/log-api.js'
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
  USER_SETTINGS_OPTIONS,
} from '../constant/index.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logEvent('bookmark.onCreated <-', node);

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      memo.createBkmInActiveDialog(node.id, node.parentId)
      await memo.addRecentTag(node)
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);


    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK] && changeInfo.title) {
      await memo.updateTag(bookmarkId, changeInfo.title)
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    const [node] = await chrome.bookmarks.get(bookmarkId)

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });        
  },
  async onMoved(bookmarkId, { oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-', { oldParentId, parentId });
    memo.bkmFolderById.delete(bookmarkId);

    const [node] = await chrome.bookmarks.get(bookmarkId)
    logDebug('bookmark.onMoved <-', node);

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      if (memo.isCreatedInActiveDialog(bookmarkId, oldParentId)) {
        memo.removeFromActiveDialog(oldParentId)
        await memo.addRecentTag({ parentId });
      } else if (oldParentId && !!node.url) {
        await Promise.all([
          chrome.bookmarks.create({
            parentId: oldParentId,
            title: node.title,
            url: node.url
          }),
          chrome.bookmarks.remove(bookmarkId),
        ])
        await chrome.bookmarks.create({
          parentId,
          title: node.title,
          url: node.url
        })
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      memo.removeFromActiveDialog(node.parentId)
      
      if (!node.url) {
        await memo.removeTag(bookmarkId)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}