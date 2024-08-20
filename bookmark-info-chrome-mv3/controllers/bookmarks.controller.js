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
  STORAGE_KEY,
  IS_BROWSER_CHROME,
} from '../constant/index.js'
import {
  tagList,
} from '../api/tagList.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logEvent('bookmark.onCreated <-', node);

    let fromTag
    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      ({ fromTag } = memo.createBkmInActiveDialog(node.id, node.parentId))
      if (!fromTag) {
        await tagList.addRecentTag(node)
      }
    }

    if (node.url) {
      if (node.url === memo.activeTabUrl) {
        // changes in active tab
        await updateActiveTab({
          debugCaller: 'bookmark.onCreated'
        });
      } else {
        // changes in bookmark manager
        getBookmarkInfoUni({ url: node.url });
      }
    }

    if (fromTag) {
      tagList.addRecentTag(node)
    }
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);


    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] && changeInfo.title) {
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
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
    
    // switch (true) {
    //   // in bookmark manager. no changes for this extension
    //   case parentId === oldParentId: {
    //     break
    //   }
    //   // in bookmark manager.
    //   case index < lastIndex: {
    //     getBookmarkInfoUni({ url: node.url });
    //     break
    //   }
    //   // parentId !== oldParentId && index == lastIndex
    //   // in bookmark manager OR in active tab
    //   default: {

    //   }
    // }
    let node 
    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] || parentId !== oldParentId) {
      ([node] = await chrome.bookmarks.get(bookmarkId))
    }
    
    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      await tagList.addRecentTag(node);
    }

    // EPIC_ERROR if (parentId ==! oldParentId) {
    if (parentId !== oldParentId) {
      logDebug('bookmark.onMoved <-', node);

      if (!node.url) {
        memo.bkmFolderById.delete(bookmarkId);
      }

      const childrenList = await chrome.bookmarks.getChildren(parentId)
      const lastIndex = childrenList.length - 1

      // changes in active tab or in bookmark manager
      if (index === lastIndex) {
        if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {

          if (memo.isCreatedInActiveDialog(bookmarkId, oldParentId)) {
            logDebug('bookmark.onMoved 11');
            memo.removeFromActiveDialog(oldParentId)
          } else if (oldParentId && !!node.url && IS_BROWSER_CHROME && !memo.isActiveTabBookmarkManager) {
            logDebug('bookmark.onMoved 22');
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
          logDebug('bookmark.onMoved 33');
        }
  
        await updateActiveTab({
          debugCaller: 'bookmark.onMoved'
        });
      }

      // changes in bookmark manager
      getBookmarkInfoUni({ url: node.url });
    }

  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);

    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
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