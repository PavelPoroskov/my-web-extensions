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

moveVersionToManifest()
