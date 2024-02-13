
const SHOW_LOG = true;
const log = SHOW_LOG ? console.log : () => { };

const supportedProtocols = ["https:", "http:"];

function isSupportedProtocol(urlString) {
  let url = document.createElement('a');
  url.href = urlString;

  return supportedProtocols.indexOf(url.protocol) != -1;
}

function getBookmarkInfo(url, fnResolve) {
  chrome.bookmarks.search(
    { url },
    (bookmarks) => {
      const bookmark = bookmarks[0];
      const parentId = bookmark && bookmark.parentId;

      if (parentId) {
        chrome.bookmarks.get(
          parentId, 
          (bookmarkFolder) => {
            fnResolve({
              folderName: bookmarkFolder[0].title,
            });
          }
        );
      } else {
        fnResolve();
      }
    },
  );
}

function updateTab(tab) {
  log('updateTab 00', tab)
  if (isSupportedProtocol(tab.url)) {
    log('updateTab 11')
    getBookmarkInfo(
      tab.url,
      (bookmarkInfo) => {
        log('updateTab 22')
        chrome.tabs.sendMessage(tab.id, {
          command: "bookmarkInfo",
          folderName: bookmarkInfo?.folderName,
        });    
      }
    )
  }
}

function updateActiveTab() {
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    (tabs) => {
      if (tabs[0]) {
        updateTab(tabs[0]);
      }
    }
  );
}

const tabsOnUpdated = (tabId, changeInfo, Tab) => {
  log('tabsOnUpdated')
  log('   changeInfo', changeInfo)
  log('   changeInfo.url', changeInfo.url)
  if (changeInfo.url || changeInfo?.status === 'complete') {
    updateTab(Tab);
  }
}
const tabsOnActivated = ({ tabId }) => {
  chrome.tabs.get(
    tabId,
    (Tab) => {
      updateTab(Tab);
    }
  )
}

// listen for bookmarks being created
chrome.bookmarks.onCreated.addListener(updateActiveTab);

// listen for bookmarks being removed
chrome.bookmarks.onRemoved.addListener(updateActiveTab);
chrome.bookmarks.onMoved.addListener(updateActiveTab);
//? chrome.bookmarks.onChanged

// listen to tab URL changes
chrome.tabs.onUpdated.addListener(tabsOnUpdated);

// listen to tab switching
chrome.tabs.onActivated.addListener(tabsOnActivated);

// listen for window switching
chrome.windows.onFocusChanged.addListener(updateActiveTab);

updateActiveTab();
