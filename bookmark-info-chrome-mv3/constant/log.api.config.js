const logModuleList = [
  // 'bookmarks.controller.js',
  // 'bookmark-create.js',
  // 'bookmark-ignore.js',
  // 'bookmarkQueue.js',
  // 'browserStartTime',
  // 'cache',
  // 'clear-url.js',
  // 'clearUrlInActiveTab.js',
  // 'commands.controller',
  // 'contextMenu.controller',
  // 'folderCreator.js',
  // 'extensionSettings.js',
  // 'folderQueue.js',
  // 'find-create.js',
  // 'find-folder.js',
  // 'folder-ignore.js',
  // 'get-bookmarks.api.js',
  // 'getUrlFromUrl',
  // 'history.api',
  // 'incoming-message.js',
  // 'incoming-message.js/TAB_IS_READY',
  // 'incoming-message.js/PAGE_EVENT',
  // 'init-extension',
  // 'memo',
  // 'mergeFolders.js',
  // 'moveFolders.js',
  // 'moveOldDatedFolders.js',
  // 'orderBookmarks.js',
  // 'page.api.js',
  // 'pageReady.js',
  // 'runtime.controller',
  // 'showAuthorBookmarks.js',
  // 'storage.api.js',
  // 'storage.controller',
  // 'updateTab.js',
  // 'tabs.controller.js',
  // 'tagList-getRecent.js',
  // 'tagList-highlight.js',
  // 'tagList.js',
  // 'url-is.js',
  // 'url-search.js',
  // 'url-settings.js',
  // 'visited-urls.js',
  // 'windows.controller',
]
export const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
