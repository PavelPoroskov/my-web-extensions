import {
  logEvent,
  logSendEvent,
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
  removeQueryParamsIfTarget,
} from '../api/clean-url-api.js'
import {
  USER_SETTINGS_OPTIONS,
} from '../constant/index.js'

async function replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId }) {
  const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });
  const isExist = bookmarkList.some(({ parentId }) => parentId === node.parentId)

  if (!isExist) {
    await chrome.bookmarks.create({
      parentId: node.parentId,
      title: node.title,
      url: cleanUrl
    })
  }

  const msg = {
    command: "changeLocationToCleanUrl",
    cleanUrl,
  }
  logSendEvent('bookmarksController.onCreated()', activeTab.id, msg)
  await chrome.tabs.sendMessage(activeTab.id, msg)

  memo.tabMap.set(activeTab.id, {
    bookmarkId,
    originalUrl: node.url
  })
}

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

    if (node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);

      if (node.url !== cleanUrl) {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;
  
        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        }
      }      
    }
  
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

    if (changeInfo.title && node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        } else if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });

          await Promise.all(bookmarkList.map(
            bItem => chrome.bookmarks.update(bItem.id, { title: changeInfo.title })
          ))
        }

      }
    }

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


    if ((oldParentId || parentId) && node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        
        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        } else if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });
          const cleanBkmWithOldParentId = bookmarkList.filter(({ parentId }) => parentId === oldParentId)

          await Promise.all(cleanBkmWithOldParentId.map(
            bItem => chrome.bookmarks.move(bItem.id, { parentId })
          ))
        }
      }
    }

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

    if (node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await chrome.bookmarks.search({ url: cleanUrl });

          await Promise.all(bookmarkList.map(
            bItem => chrome.bookmarks.remove(bItem.id)
          ))  

          memo.tabMap.delete(activeTab.id)
        }
      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}