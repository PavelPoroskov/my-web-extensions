const logModuleList = [
  // 'bookmarks.api',
  // 'bookmarks.controller',
  // 'browserStartTime',
  // 'cache',
  // 'url.api',
  // 'clearUrlInActiveTab',
  // 'commands.controller',
  // 'contextMenu.controller',
  // 'debounceQueue',
  // 'extensionSettings',
  // 'folder.api',
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
  // 'windows.controller',
]
export const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
