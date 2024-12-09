import {
  createFileForFirefox,
  moveVersionToManifest,
} from './create-file-for-firefox.mjs'

createFileForFirefox(
  [
    'constant/browser-specific.js',
    'constant/clean-url.js',
    'constant/command-id.js',
    'constant/id.js',
    'constant/optimization-cache.js',
    'constant/storage.js',
    'constant/index.js',
    
    'api/log-api-config.js',
    'api/log-api.js',
    'api/structure/extraMap.js',
    'api/structure/cache.js',
      'api/storage-api.js',
    'api/structure/memo.js',
    'api/structure/extensionSettings.js',
    'api/structure/browserStartTime.js',
    
    'api/common-api.js',
    'api/special-folder.api.js',
    'api/recent-api.js',
      'api/structure/tagList.js',
      'api/structure/index.js',
    'api/clean-url-api.js',
    'api/bookmarks-api.js',
    'api/history-api.js',
    'api/init-extension.js',
    'api/tabs-api.js',
    'api/pluralize-rules.js',
    'api/pluralize.js',
    'bookmark-list-ops/flatFolders.js',
    'bookmark-list-ops/mergeFolders.js',
    'bookmark-list-ops/moveNotDescriptiveFolders.js',
    'bookmark-list-ops/moveRootBookmarks.js',
    'bookmark-list-ops/moveTodoToBkmBar.js',
    'bookmark-list-ops/removeDoubleBookmarks.js',
    'bookmark-list-ops/sortFolders.js',
    'bookmark-list-ops/flat-structure.js',
    'bookmark-list-ops/index.js',

    'api/command/addBookmark.js',
    'api/command/addRecentTagFromView.js',
    'api/command/clearUrlInActiveTab.js',
    'api/command/closeBookmarkedTabs.js',
    'api/command/closeDuplicateTabs.js',
    'api/command/deleteBookmark.js',
    'api/command/fixTag.js',
    'api/command/moveToFlatFolderStructure.js',
    'api/command/switchShowRecentList.js',
    'api/command/unfixTag.js',
    'api/command/toggleYoutubeHeader.js',
    'api/command/index.js',

    'controllers/bookmarks.controller.js',
    'controllers/contextMenus.controller.js',
    'controllers/incoming-message.js',
    'controllers/runtime.controller.js',
    'controllers/storage.controller.js',
    'controllers/tabs.controller.js',
    'controllers/windows.controller.js',

    'bkm-info-sw.js',
  ],
  'background.js',
)

createFileForFirefox(
  [
    'content-script.js',
  ],
  'content-script.js',
)

createFileForFirefox(
  [
    'options/options.html',
  ],
  'options/options.html',
)
createFileForFirefox(
  [
    'options/options.js',
  ],
  'options/options.js',
)
createFileForFirefox(
  [
    'popup/popup.html',
  ],
  'popup/popup.html',
)
createFileForFirefox(
  [
    'popup/popup.js',
  ],
  'popup/popup.js',
)

createFileForFirefox(
  [
    'README.md',
  ],
  'README.md',
)

moveVersionToManifest()
