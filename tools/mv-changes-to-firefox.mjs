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
    'api/promiseQueue.js',
    'api/main-api.js',
    'controllers/bookmarks.controller.js',
    'controllers/runtime.controller.js',
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

moveVersionToManifest()
