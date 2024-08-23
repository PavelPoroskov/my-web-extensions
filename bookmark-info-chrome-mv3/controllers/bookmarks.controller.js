import {
  getBookmarkInfoUni,
} from '../api/bookmarks-api.js'
import {
  logDebug,
} from '../api/log-api.js'
import {
  clearTempBookmarkTitle,
  isTempBookmarkNode,
  // repositionLastBookmarkOnCreated,
} from '../api/reposition-api.js'
import {
  activeDialog,
  extensionSettings,
  memo,
  tagList,
} from '../api/structure/index.js'
import {
  updateActiveTab,
} from '../api/tabs-api.js'
import {
  IS_BROWSER_CHROME,
  STORAGE_KEY
} from '../constant/index.js'

export const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logDebug('bookmark.onCreated <-', node);
    const settings = await extensionSettings.get()

    if (node.url) {
      if (isTempBookmarkNode(node)) {
        return
      }
      activeDialog.createBkmStandard(node.id, node.parentId)
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.addRecentTag(node)
      }
    } else {
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.addRecentTag(node)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });

    // if (node.url && urlToBkmList.get(url).length > 0) {
    //   if (settings[STORAGE_KEY.SET_START_SEARCH_POSITION]) {
    //     await repositionLastBookmarkOnCreated(node)
    //   }
    // }
  },
  async onChanged(bookmarkId, changeInfo) {
    logDebug('bookmark.onChanged 00 <-', bookmarkId, changeInfo);
    const settings = await extensionSettings.get()

    const [node] = await chrome.bookmarks.get(bookmarkId)

    // eslint-disable-next-line no-empty
    if (node.url) {
      
    } else {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] && changeInfo.title) {
        await tagList.updateTag(bookmarkId, changeInfo.title)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });   

    // if (node.url) {
    //   if (settings[STORAGE_KEY.SET_START_SEARCH_POSITION]) {
    //     await repositionLastBookmarkOnCreated(node)
    //   }
    // }
  },
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    logDebug('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
    const settings = await extensionSettings.get()
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
    const [node] = await chrome.bookmarks.get(bookmarkId)
    
    if (node.url) {
      if (parentId !== oldParentId) {
        const isCreatedInActiveDialog = activeDialog.isCreatedInActiveDialog(bookmarkId, oldParentId)
        if (isCreatedInActiveDialog) {
          // logDebug('bookmark.onMoved 11');
          activeDialog.removeBkm(oldParentId)
        }

        if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
          await tagList.addRecentTag(node);

          if (!isCreatedInActiveDialog) {
            if (IS_BROWSER_CHROME) {
              if (!memo.isActiveTabBookmarkManager) {
                if (isTempBookmarkNode({ parentId: oldParentId, title: node.title, url: node.url })) {
                  await chrome.bookmarks.update(node.id, {
                    title: clearTempBookmarkTitle(node.title),
                  })
                } else {
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
              }
            // } else if (IS_BROWSER_FIREFOX) {
              
            }
          }
        }
      }
    } else {
      memo.bkmFolderById.delete(bookmarkId);
    }

    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url })

    // if (node.url) {
    //   if (settings[STORAGE_KEY.SET_START_SEARCH_POSITION]) {
    //     await repositionLastBookmarkOnCreated(node)
    //   }
    // }
  },
  async onRemoved(bookmarkId, { node }) {
    logDebug('bookmark.onRemoved <-');

    if (node.url) {
      if (isTempBookmarkNode(node)) {
        return
      }

      activeDialog.removeBkm(node.parentId)   
    } else {
      memo.bkmFolderById.delete(bookmarkId);
      const settings = await extensionSettings.get()
      
      if (settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
        await tagList.removeTag(bookmarkId)
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