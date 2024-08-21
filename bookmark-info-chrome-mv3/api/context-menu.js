import {
  BROWSER_SPECIFIC,
  CONTEXT_MENU_ID,
} from '../constant/index.js'

// MAYBE did can we not create menu on evert time
export async function createContextMenu() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url',
  });
  // MAYBE? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });
  // MAYBE? bookmark and close tabs (tabs without bookmarks)
}
