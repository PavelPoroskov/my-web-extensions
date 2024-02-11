let currentTab;
let currentBookmark;
let bookmarkFolder;

const SHOW_LOG = false
const log = SHOW_LOG ? console.log : () => { };

function updateActiveTab(tabs) {

  function isSupportedProtocol(urlString) {
    let supportedProtocols = ["https:", "http:"];
    let url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
  }

  function doGetBookmarkParent(parent) {
    log('parent', parent);
    bookmarkFolder = parent[0].title;
    log('bookmarkFolder', bookmarkFolder);
    log('currentTab.id', currentTab.id);
    chrome.tabs.sendMessage(currentTab.id, {
      command: "bookmarkFolder",
      bookmarkFolder,
    });
  }
  function doBookmarkSearchResult(bookmarks) {
    log('searching result', bookmarks);
    currentBookmark = bookmarks[0];
    const parentId = currentBookmark && currentBookmark.parentId;

    if (parentId) {
      chrome.bookmarks.get(parentId, doGetBookmarkParent);
    } else {
      bookmarkFolder = undefined;
      chrome.tabs.sendMessage(currentTab.id, {
        command: "bookmarkFolder",
        bookmarkFolder,
      });
    }
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      if (isSupportedProtocol(currentTab.url)) {
        let searching = chrome.bookmarks.search({ url: currentTab.url }, doBookmarkSearchResult);
      } else {
        console.log(`Bookmark it! does not support the '${currentTab.url}' URL.`)
      }
    }
  }

  let gettingActiveTab = chrome.tabs.query({ active: true, lastFocusedWindow: true }, updateTab);
  // gettingActiveTab.then(updateTab);
}

// listen for bookmarks being created
chrome.bookmarks.onCreated.addListener(updateActiveTab);

// listen for bookmarks being removed
chrome.bookmarks.onRemoved.addListener(updateActiveTab);
chrome.bookmarks.onMoved.addListener(updateActiveTab);

// listen to tab URL changes
chrome.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
chrome.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
chrome.windows.onFocusChanged.addListener(updateActiveTab);

updateActiveTab();
