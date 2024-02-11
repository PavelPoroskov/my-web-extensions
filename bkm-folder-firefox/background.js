let currentTab;
let currentBookmark;
let bookmarkFolder;

const SHOW_LOG = false
const log = SHOW_LOG ? console.log : () => { };

function updateActiveTab(tabs) {

  function isSupportedProtocol(urlString) {
    let supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    let url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      if (isSupportedProtocol(currentTab.url)) {
        let searching = browser.bookmarks.search({ url: currentTab.url });
        searching.then((bookmarks) => {
          log('searching result', bookmarks);
          currentBookmark = bookmarks[0];
          const parentId = currentBookmark && currentBookmark.parentId;

          if (parentId) {
            browser.bookmarks.get(parentId).then((parent) => {
              log('parent', parent);
              bookmarkFolder = parent[0].title;
              log('bookmarkFolder', bookmarkFolder);
              log('currentTab.id', currentTab.id);
              browser.tabs.sendMessage(currentTab.id, {
                command: "bookmarkFolder",
                bookmarkFolder,
              });
            });
          } else {
            bookmarkFolder = undefined;
            browser.tabs.sendMessage(currentTab.id, {
              command: "bookmarkFolder",
              bookmarkFolder,
            });
          }
        });
      } else {
        console.log(`Bookmark it! does not support the '${currentTab.url}' URL.`)
      }
    }
  }

  let gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
  gettingActiveTab.then(updateTab);
}

// listen for bookmarks being created
browser.bookmarks.onCreated.addListener(updateActiveTab);

// listen for bookmarks being removed
browser.bookmarks.onRemoved.addListener(updateActiveTab);
browser.bookmarks.onMoved.addListener(updateActiveTab);

// listen to tab URL changes
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

updateActiveTab();
