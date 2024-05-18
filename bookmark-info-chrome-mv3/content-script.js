const SHOW_LOG = false
//const SHOW_LOG = true
const log = SHOW_LOG ? console.log : () => {};

(async function() {
  log('IN content-script');

  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const BROWSER_OPTIONS = {
    CHROME: 'CHROME',
    FIREFOX: 'FIREFOX',
  }
  const BROWSER_SPECIFIC_OPTIONS = {
    [BROWSER_OPTIONS.CHROME]: {
      DEL_BTN_RIGHT_PADDING: '0.5ch',
    },
    [BROWSER_OPTIONS.FIREFOX]: {
      DEL_BTN_RIGHT_PADDING: '0.8ch',
    },
  }
  const BROWSER = BROWSER_OPTIONS.CHROME;
  const BROWSER_SPECIFIC = BROWSER_SPECIFIC_OPTIONS[BROWSER];
  
  const bkmInfoRootId = 'bkmInfoRootId';

  const STYLE = {
    root: [
      'position: fixed',
      'right: 0',
      'top: 0',
      'z-index: 2147483646',
      'background-color: transparent',
      // styles for label, delBtn
      'font-size: 14px',
      'font-family: sans-serif',
      'font-weight: normal',
      'user-select: none',
      'line-height: 1.2',
    ].join(';'),
    row: [
      'display: flex',
      'position: relative',
    ].join(';'),
    rowLeft: [
      'flex: 1',
    ].join(';'),
    label: [
      'padding-left: 0.7ch',
      'border-top-left-radius: 0.5lh 50%',
      'border-bottom-left-radius: 0.5lh 50%',
      'color: black',
      'position: relative',
    ].join(';'),
    delBtn: [
      'padding-left: 0.65ch',
      `padding-right: ${BROWSER_SPECIFIC.DEL_BTN_RIGHT_PADDING}`,
      'border-top-left-radius: 0.5lh 50%',
      'border-bottom-left-radius: 0.5lh 50%',
      'position: absolute',
      'top: 0',
      'right: 0',
      'z-index: 2147483647',
      'cursor: pointer',
      'height: 1lh',
      'align-items: center',
      'justify-items: center',
     ].join(';'),
    delBtnLetter: [
      'color: white',
      'font-size: 10px',
      'line-height: 1',
    ].join(';'),
  }
  const STYLE_ELEMENT = (
`
.bkmLabel:hover + .bkmDelBtn {
  display: flex;
  background-color: pink;
}
.bkmDelBtn {
  display: none;
}
.bkmDelBtn:hover {
  display: flex;
  background-color: red;
}
.bkmDelBtn:active {
  transform: translateY(0.1ch);
}
.bkmLabel::before {
  content: attr(data-restpath);
  text-wrap: nowrap;
  position:absolute;
  right:100%;  
  background: lightgray;
  color: black;
  display:none;
  padding-left: 2px;
  padding-right: 2px;
}
.bkmLabel:hover::before {
  display:block;
}
.bkmLabel:has(+ .bkmDelBtn:hover) {
  &::before {
    display:block;
  }
}
`
  );
  
  async function deleteBookmark(event) {
    log('deleteBookmark 00');
    const bkmId = event?.target?.dataset?.bkmid || event?.target?.parentNode?.dataset?.bkmid;

    if (bkmId) {
      await chrome.runtime.sendMessage({
        command: "deleteBookmark",
        bkmId,
      });
    }
  }

  async function hideBookmarks() {
    log('hideBookmarks 00');
    const rootDiv = document.getElementById(bkmInfoRootId);

    if (rootDiv) {
      while (rootDiv.lastChild) {
        rootDiv.removeChild(rootDiv.lastChild);
      }  
    }
  }

  function showBookmarkInfo(bkmInfoList) {
    log('showBookmarkInfo 00');

    let rootDiv = document.getElementById(bkmInfoRootId);

    if (!rootDiv) {
      log('showBookmarkInfo 22 2');
      const rootStyle = document.createElement('style');
      const textNodeStyle = document.createTextNode(STYLE_ELEMENT);
      rootStyle.appendChild(textNodeStyle);

      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', bkmInfoRootId);
      rootDiv.style = STYLE.root;

      document.body.insertAdjacentElement('afterbegin', rootStyle);        
      rootStyle.insertAdjacentElement('afterend', rootDiv);        
    }
  
    const colors = [
      'yellow',
      'orange'
    ]
    const rawNodeList = rootDiv.childNodes;
    const beforeRawLength = rawNodeList.length;

    bkmInfoList.forEach(({ id, shortPath, restPath }, index) => {
      const divRow = document.createElement('div');
      divRow.style = STYLE.row;

      const divL = document.createElement('div');
      divL.style = STYLE.rowLeft;

      const divLabel = document.createElement('div');
      divLabel.style = `${STYLE.label};background-color:${colors[index % 2]}`;
      divLabel.classList.add('bkmLabel');

      // createTextNode is safe method for XSS-injection
      const textNode = document.createTextNode(`${shortPath} :bkm`);
      divLabel.appendChild(textNode);
      divLabel.addEventListener('click', hideBookmarks);
      // TODO sanitize: remove ",<,>
      // const sanitizedFullPath = fullPath
      //   .replaceAll('"', '&quot;')
      //   .replaceAll('>', '&gt;')
      //   .replaceAll('<', '&lt;')
      // divLabel.setAttribute('data-restpath', sanitizedFullPath);
      //
      // Symbols ( " > < ) don't break html and displayed as text.
      divLabel.setAttribute('data-restpath', restPath);

      const divDelBtn = document.createElement('div');
      divDelBtn.style = STYLE.delBtn;
      divDelBtn.setAttribute('data-bkmid', id);
      divDelBtn.classList.add('bkmDelBtn');

      const divDelBtnLetter = document.createElement('div');
      divDelBtnLetter.style = STYLE.delBtnLetter;
      const textNodeDel = document.createTextNode('X');
      divDelBtnLetter.appendChild(textNodeDel);
      
      divDelBtn.appendChild(divDelBtnLetter);
      divDelBtn.addEventListener('click', deleteBookmark);

      divRow.appendChild(divL);
      divRow.appendChild(divLabel);
      divRow.appendChild(divDelBtn);
      
      if (index < beforeRawLength) {
        rootDiv.replaceChild(divRow, rawNodeList[index]);
      } else {
        rootDiv.appendChild(divRow);
      }
    })

    let rawListLength = beforeRawLength;
    while (bkmInfoList.length < rawListLength) {
      rootDiv.removeChild(rootDiv.lastChild);
      rawListLength -= 1;
    }
  }

  let hasBookmark = undefined;

  chrome.runtime.onMessage.addListener((message) => {
    switch (message.command) {
      case "bookmarkInfo": {
        log('content-script: ', message.bookmarkInfoList);

        const newHasBookmark = message.bookmarkInfoList.length > 0;
  
        if (newHasBookmark || hasBookmark) {
          showBookmarkInfo(message.bookmarkInfoList);
        }
  
        hasBookmark = newHasBookmark;
        break
      }
      case "changeLocationToCleanUrl": {
        log('content-script: changeLocationToCleanUrl', message);
        if (document.location.href.startsWith(message.cleanUrl)) {
          //document.location.href = message.cleanUrl
          //window.history.pushState(message.cleanUrl)
          window.history.replaceState(null, "", message.cleanUrl);
        }
        
        break
      }
    }

  });

  log('before send contentScriptReady');
  try {
    await chrome.runtime.sendMessage({
      command: "contentScriptReady",
      url: document.location.href,
    });
    log('after send contentScriptReady');
  } catch (er) {
    log('IGNORE send contentScriptReady', er);
  }
})();
