import {
  createFileForFirefox,
  moveVersionToManifest,
} from './create-file-for-firefox.mjs'

createFileForFirefox(
  [
    'constant/browser-specific.js',
    'constant/message-id.js',
    'constant/id.js',
    'constant/optimization-cache.js',
    'constant/index.js',

    'api/log.api.config.js',
    'api/log.api.js',
    'data-structures/extraMap.js',
    'data-structures/cache.js',
    'api/storage.api.config.js',
    'api/storage.api.js',
    'data-structures/memo.js',
    'data-structures/extensionSettings.js',
    'data-structures/browserStartTime.js',
    'data-structures/ignoreBkmControllerApiActionSet.js',

    'api/common.api.js',
    'api/bookmark.api.js',
    'api/special-folder.api.js',
    'api/recent.api.js',
    'data-structures/tagList.js',
    'data-structures/index.js',
    'api/content-script.api.js',
    'api/url.api.config.js',
    'api/url-search.api.js',
    'api/clear-url.api.js',
    'api/get-bookmarks.api.js',
    'api/history.api.js',
    'api/init-extension.js',
    'api/tabs.api.js',
    'api/pluralize-rules.js',
    'api/pluralize.js',
    'api/text.api.js',
    'api/find-folder.api.js',
    'bookmark-list-ops/flatFolders.js',
    'bookmark-list-ops/mergeFolders.js',
    'bookmark-list-ops/moveNotDescriptiveFolders.js',
    'bookmark-list-ops/moveRootBookmarks.js',
    'bookmark-list-ops/moveTodoToBkmBar.js',
    'bookmark-list-ops/removeDoubleBookmarks.js',
    'bookmark-list-ops/sortFolders.js',
    'bookmark-list-ops/flat-structure.js',
    'bookmark-list-ops/index.js',

    'command/addBookmark.js',
    'command/addRecentTagFromView.js',
    'command/clearUrlInActiveTab.js',
    'command/closeBookmarkedTabs.js',
    'command/closeDuplicateTabs.js',
    'command/deleteBookmark.js',
    'command/fixTag.js',
    'command/getUrlFromUrl.js',
    'command/moveToFlatFolderStructure.js',
    'command/switchShowRecentList.js',
    'command/unfixTag.js',
    'command/toggleYoutubeHeader.js',
    'command/index.js',

    'controllers/bookmarks.controller.js',
    'controllers/commands.controller.js',
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
