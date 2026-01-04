import {
  createFileForFirefox,
  moveVersionToManifest,
} from './create-file-for-firefox.mjs'

await createFileForFirefox(
  [
    'constant/browser-specific.js',
    'constant/message-id.js',
    'constant/id.js',
    'constant/storage.api.config.js',
    'constant/log.api.config.js',
    'constant/url.api.config.js',
    'constant/index.js',

    'api-low/common.js',
    'api-low/pluralize-rules.js',
    'api-low/pluralize.js',
    'api-low/log.api.js',
    'api-low/storage.api.js',
    'api-low/cache.js',
    'api-low/extraMap.js',
    'api-low/index.js',

    'folder-api/folder-directives.js',
    'folder-api/folder-dated-title.js',
    'folder-api/folder-title.js',
    'folder-api/special-folder.js',
    'folder-api/root-folders.js',
    'folder-api/find-folder.js',
    'folder-api/folder-place.js',
    'folder-api/index.js',

    'api-mid/extensionSettings.js', // dependencies: storage.api.js, log.api.js
    'api-mid/page.api.js',
    'api-mid/memo.js',
    'api-mid/browserStartTime.js',
      'bookmark-list-api/bookmark-list.js',
    'api-mid/tagList-getRecent.js',
    'api-mid/tagList-highlight.js',
    'api-mid/tagList.js',
    'api-mid/index.js',

    'url-api/url-settings.js',
    'url-api/url-partial.js',
    'url-api/url-search-is.js',
    'url-api/url-search.js',
    'url-api/clear-url.js',
    'url-api/url-author.js',
    'url-api/url-is.js',
    'url-api/index.js',

    'bookmark-controller-api/ignoreBkmControllerApiActionSet.js',
    'bookmark-controller-api/folder-ignore.js',
    'bookmark-controller-api/folder-move.js',
    'bookmark-controller-api/folder-create.js',
    'bookmark-controller-api/folderCreator.js',
    'bookmark-controller-api/bookmark-ignore.js',
      'bookmark-list-api/bookmark-list-with-parent.js',
    'bookmark-controller-api/bookmark-dated.js',

    'api/urlEvents.js',
    'bookmark-controller-api/bookmark-create.js',

    'bookmark-controller-api/bookmark-visited.js',
    'bookmark-controller-api/nodeTaskQueue.js',

    'api/visited-urls.js',
    'api/init-extension.js',

    'api/history.api.js',
      'bookmark-list-api/bookmark-list-partial.js',
    'api/showAuthorBookmarks.js',
      'bookmark-list-api/bookmark-list-with-path.js',
      'bookmark-list-api/bookmark-list-with-template.js',
      'bookmark-list-api/index.js',
    'api/updateTab.js',
    'api/index.js',

    'bookmark-controller-api/bookmarkQueue.js',
    'bookmark-controller-api/folderQueue.js',
    'bookmark-controller-api/index.js',

    'bookmark-list-ops/traverseFolder.js',
    'bookmark-list-ops/mergeFolders.js',
    'bookmark-list-ops/moveNotDescriptiveFolders.js',
    'bookmark-list-ops/moveRootBookmarks.js',
    'bookmark-list-ops/moveFolders.js',
    'bookmark-list-ops/moveOldDatedFolders.js',
    'bookmark-list-ops/removeDoubleBookmarks.js',
    'bookmark-list-ops/removeDoubleDatedBookmarks.js',
    'bookmark-list-ops/sortFolders.js',
    'bookmark-list-ops/replaceHostname.js',
    'bookmark-list-ops/orderBookmarks.js',
    'bookmark-list-ops/index.js',

    'migration/migration20250520.js',
    'migration/migration20250706.js',
    'migration/migration.js',
    'migration/index.js',

    'command/addBookmark.js',
    'command/clearUrlInActiveTab.js',
    'command/closeBookmarkedTabs.js',
    'command/closeDuplicateTabs.js',
    'command/getUrlFromUrl.js',
    'command/moveToFlatFolderStructure.js',
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

await createFileForFirefox(
  [
    'content-script.js',
  ],
  'content-script.js',
)

await createFileForFirefox(
  [
    'options/options.html',
  ],
  'options/options.html',
)
await createFileForFirefox(
  [
    'options/options.js',
  ],
  'options/options.js',
)
await createFileForFirefox(
  [
    'popup/popup.html',
  ],
  'popup/popup.html',
)
await createFileForFirefox(
  [
    'popup/popup.js',
  ],
  'popup/popup.js',
)

await createFileForFirefox(
  [
    'README.md',
  ],
  'README.md',
)

await moveVersionToManifest()
