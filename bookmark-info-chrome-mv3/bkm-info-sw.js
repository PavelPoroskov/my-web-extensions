import { storageController } from './controllers/storage.controller.js';
import { bookmarksController } from './controllers/bookmarks.controller.js';
import { tabsController } from './controllers/tabs.controller.js';
import { windowsController } from './controllers/windows.controller.js';
import { contextMenusController } from './controllers/contextMenus.controller.js';
import { commandsController } from './controllers/commands.controller.js';

import { runtimeController } from './controllers/runtime.controller.js';

chrome.storage.onChanged.addListener(storageController.onChanged);

chrome.bookmarks.onCreated.addListener(bookmarksController.onCreated);
chrome.bookmarks.onMoved.addListener(bookmarksController.onMoved);
chrome.bookmarks.onChanged.addListener(bookmarksController.onChanged);
chrome.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

// listen for window switching
chrome.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

// chrome.tabs.onCreated.addListener(tabsController.onCreated);
chrome.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
chrome.tabs.onActivated.addListener(tabsController.onActivated);
chrome.tabs.onRemoved.addListener(tabsController.onRemoved);

chrome.commands.onCommand.addListener(commandsController.onCommand);
chrome.contextMenus.onClicked.addListener(contextMenusController.onClicked);

chrome.runtime.onStartup.addListener(runtimeController.onStartup)
chrome.runtime.onInstalled.addListener(runtimeController.onInstalled);
chrome.runtime.onMessage.addListener(runtimeController.onMessage);
