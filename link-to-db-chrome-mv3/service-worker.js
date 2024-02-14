const MENU_ID = {
  LINK: 'extLinkToDbLink',
};

async function onClicked (info, tab) {
  if (info.menuItemId === MENU_ID.LINK)
  console.log('Link-to-db.onClick');
  console.log('linkUrl', info.linkUrl);
  console.log('pageUrl', info.pageUrl);

  //option 0 //call server api and not show dialog
  // but we need dialog

  //option 1 open frontapp in next tab
  // const myAppUrl = '?url=linkUrl';
  // chrome.tabs.create({ url: myAppUrl, index: tab.index + 1 });

  //option 2 open popup in the same page
  // chrome.action.openPopup()
  // but popup is for extension options

  //option 3 use side panel
  //chrome.sidePanel.open()
  // but sidepanel for all tabs of a window
  // communicating with side panel?

  //option 4 open injected in page modal 
  // chrome.tabs.sendMessage(tab.id, {
  //   command: "linkInfo",
  //   linkUrl: info.linkUrl,
  //   pageUrl: info.pageUrl,
  // });    

  //option 5
  // window type popup
  // window type "devtools"
  const currentWindows = await chrome.windows.getCurrent();
  // console.log('currentWindows');
  // console.log({
  //   top: currentWindows.top,
  //   left: currentWindows.left,
  //   height: currentWindows.height,
  //   width: currentWindows.width, 
  // });

  const width = currentWindows.width/2;
  const height = currentWindows.height/2;
  const top = currentWindows.top + (currentWindows.height - height)/2;
  const left = currentWindows.left + (currentWindows.width - width)/2;
  // console.log('calculated', {
  //   width,
  //   height,
  //   top,
  //   left,
  // });

  chrome.windows.create({
    left,
    top, 
    width, 
    height,
    // type: 'normal',
    type: 'popup',
    // type: 'devtools', error
    // type: 'panel', // from docs deprecated, but works. I does not see difference
    url: `http:/localhost:5050?url=${encodeURIComponent(info.linkUrl)}`,
  })
  // open window from service worker or from context-script
};

chrome.contextMenus.onClicked.addListener(onClicked); 

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: MENU_ID.LINK,
    contexts: ['link'],
    title: 'link to db',
  });
});