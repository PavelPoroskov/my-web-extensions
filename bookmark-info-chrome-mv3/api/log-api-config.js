const logModuleList = [
  // 'bookmarks-api',
  // 'bookmarks.controller',
  // 'browserStartTime',
  // 'cache',
  // 'clean-url-api',
  // 'commands.controller',
  // 'contextMenu.controller',
  // 'debounceQueue',
  // 'extensionSettings',
  // 'folder.api',
  // 'incoming-message',
  // 'init-extension',
  // 'memo',
  // 'recent-api',
  // 'runtime.controller',
  // 'storage-api',
  // 'storage.controller',
  // 'tabs-api',
  // 'tabs.controller',
  // 'windows.controller',
]
export const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
