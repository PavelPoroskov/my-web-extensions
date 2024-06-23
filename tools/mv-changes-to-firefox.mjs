import {
  createFileForFirefox,
  moveVersionToManifest,
} from './create-file-for-firefox.mjs'

createFileForFirefox(
  [
    'constants.js',
    'config.js',
    'api/debug.js',
    'api/cache.js',
    'api/memo.js',
    'api/promiseQueue.js',
    'api/common-api.js',
    'api/bookmarks-api.js',
    'api/link-api.js',
    'api/history-api.js',
    'api/tabs-api.js',
    'api/tabs-list-api.js',
    'controllers/bookmarks.controller.js',
    'controllers/runtime.controller.js',
    'controllers/tabs.controller.js',
    'controllers/windows.controller.js',
    'controllers/contextMenus.controller.js',
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

moveVersionToManifest()
