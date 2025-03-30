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
    'constant/storage.api.config.js',
    'constant/log.api.config.js',
    'constant/url.api.config.js',
    'constant/index.js',

    'api-low/common.js',
    'api-low/pluralize-rules.js',
    'api-low/pluralize.js',
    'api-low/log.api.js',
    'api-low/storage.api.js',
    'api-low/extensionSettings.js', // dependencies: storage.api.js, log.api.js
    'api-low/youtube.js',
    'api-low/index.js',

    'data-structures/extraMap.js',
    'data-structures/cache.js',
    'data-structures/memo.js',
    'data-structures/browserStartTime.js',

    'folder-api/folder-title.js',
    'folder-api/special-folder.js',
    'folder-api/find-folder.js',
    'folder-api/folder-dated-title.js',
    'folder-api/index.js',

    'data-structures/tagList-getRecent.js',
    'data-structures/tagList-highlight.js',
    'data-structures/tagList.js',
    'data-structures/index.js',

    'url-api/url-settings.js',
    'url-api/url-is.js',
    'url-api/url-search.js',
    'url-api/clear-url.js',
    'url-api/url-author.js',
    'url-api/index.js',

    'api/page.api.js',
    'api/get-bookmarks.api.js',
    'api/history.api.js',
    'api/init-extension.js',
    'api/showAuthorBookmarks.js',
    'api/updateTab.js',
    'api/clearUrlOnPageOpen.js',

    'bookmark-controller-api/ignoreBkmControllerApiActionSet.js',
    'bookmark-controller-api/folder-ignore.js',
    'bookmark-controller-api/folder-create.js',
    'bookmark-controller-api/bookmark-create1.js',
    'bookmark-controller-api/bookmark-ignore.js',
    'bookmark-controller-api/bookmark-dated.js',
    'bookmark-controller-api/bookmark-create.js',
    'bookmark-controller-api/nodeTaskQueue.js',
    'bookmark-controller-api/bookmarkQueue.js',
    'bookmark-controller-api/folderQueue.js',
    'bookmark-controller-api/index.js',

    'bookmark-list-ops/flatFolders.js',
    'bookmark-list-ops/mergeFolders.js',
    'bookmark-list-ops/moveNotDescriptiveFolders.js',
    'bookmark-list-ops/moveRootBookmarks.js',
    'bookmark-list-ops/moveFolders.js',
    'bookmark-list-ops/moveOldDatedFolders.js',
    'bookmark-list-ops/removeDoubleBookmarks.js',
    'bookmark-list-ops/sortFolders.js',
    'bookmark-list-ops/orderBookmarks.js',
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
