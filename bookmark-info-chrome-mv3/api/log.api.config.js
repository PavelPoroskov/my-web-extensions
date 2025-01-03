const logModuleList = [
  // 'bookmarks.controller',
  // 'browserStartTime',
  // 'cache',
  // 'clearUrlInActiveTab',
  // 'commands.controller',
  // 'content-script.api',
  // 'contextMenu.controller',
  // 'debounceQueue',
  // 'extensionSettings',
  // 'find-folder.api.js',
  // 'get-bookmarks.api.js',
  // 'getUrlFromUrl',
  // 'history.api',
  // 'incoming-message',
  // 'init-extension',
  // 'memo',
  // 'recent.api',
  // 'runtime.controller',
  // 'storage.api',
  // 'storage.controller',
  // 'tabs.api',
  // 'tabs.controller',
  // 'tagList-highlight.js',
  // 'tagList.js',
  // 'url-search.api',
  // 'url.api.config',
  // 'windows.controller',
]
export const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
