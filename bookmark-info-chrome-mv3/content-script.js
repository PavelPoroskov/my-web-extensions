let SHOW_LOG = false
// SHOW_LOG = true
const log = SHOW_LOG ? console.log : () => {};

(async function() {
  log('IN content-script');

  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const EXTENSION_COMMAND_ID = {
    DELETE_BOOKMARK: 'DELETE_BOOKMARK',
    ADD_BOOKMARK: 'ADD_BOOKMARK',
    FIX_TAG: 'FIX_TAG',
    UNFIX_TAG: 'UNFIX_TAG',
    TAB_IS_READY: 'TAB_IS_READY',
    SHOW_TAG_LIST: 'SHOW_TAG_LIST',
  }
  const CONTENT_SCRIPT_COMMAND_ID = {
    BOOKMARK_INFO: 'BOOKMARK_INFO',
    HISTORY_INFO: 'HISTORY_INFO',
    CLEAR_URL: 'CLEAR_URL',
  }

  const SHOW_PREVIOUS_VISIT_OPTION = {
    NEVER: 0,
    ONLY_NO_BKM: 1,
    ALWAYS: 2,
  }
  const BROWSER_OPTIONS = {
    CHROME: 'CHROME',
    FIREFOX: 'FIREFOX',
  }
  const BROWSER_SPECIFIC_OPTIONS = {
    [BROWSER_OPTIONS.CHROME]: {
      DEL_BTN_RIGHT_PADDING: '0.5ch',
      LABEL_RIGHT_PADDING: '0.3ch',
    },
    [BROWSER_OPTIONS.FIREFOX]: {
      DEL_BTN_RIGHT_PADDING: '1ch',
      LABEL_RIGHT_PADDING: '0.6ch',
    },
  }
  const BROWSER = BROWSER_OPTIONS.CHROME;
  const BROWSER_SPECIFIC = BROWSER_SPECIFIC_OPTIONS[BROWSER];
    
  const bkmInfoRootId = 'bkm-info--root';
  const bkmInfoStyle2Id = 'bkm-info--style2';

  const STYLE_ELEMENT = (
`
#${bkmInfoRootId} {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 2147483646;
  background-color: transparent;
  font-size: 14px;
  font-family: sans-serif;
  font-weight: normal;
  user-select: none;
  line-height: 1.2;
  max-height: 100vh;
  overflow-y: clip;
  text-align: left;
}
.bkm-info--row {
  display: flex;
  position: relative;
}
.bkm-info--row-left {
  flex: 1;
}
.bkm-info--label {
  padding-left: 0.7ch;
  border-top-left-radius: 0.5lh 50%;
  border-bottom-left-radius: 0.5lh 50%;
  position: relative;
  color: black;
  padding-right: ${BROWSER_SPECIFIC.LABEL_RIGHT_PADDING};
}
.bkm-info--btn {
  padding-left: 0.65ch;
  padding-right: 0.65ch;
  border-top-left-radius: 0.5lh 50%;
  border-bottom-left-radius: 0.5lh 50%;
  z-index: 2147483647;
  cursor: pointer;
  height: 1lh;
  align-items: center;
  justify-items: center;
  display: none;
}
.bkm-info--btn-letter {
  color: white;
  font-size: 10px;
  line-height: 1;
}
.bkm-info--btn:active {
  transform: translateY(0.1ch);
}
.bkm-info--bkm-1 {
  background-color: yellow;
}
.bkm-info--bkm-2 {
  background-color: greenyellow;
}
.bkm-info--btn-del {
  padding-right: ${BROWSER_SPECIFIC.DEL_BTN_RIGHT_PADDING};
  position: absolute;
  top: 0;
  right: 0;
}
.bkm-info--bkm:hover + .bkm-info--btn-del {
  display: flex;
  background-color: pink;
}
.bkm-info--btn-del:hover {
  display: flex;
  background-color: red;
}
.bkm-info--bkm:hover, .bkm-info--bkm:has(+ .bkm-info--btn-del:hover) {
  min-width: 5ch;
  transition: min-width 100ms;
}
.bkm-info--bkm::before {
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
.bkm-info--bkm:hover::before {
  display:block;
}
.bkm-info--bkm:has(+ .bkm-info--btn-del:hover) {
  &::before {
    display:block;
  }
}
.bkm-info--bkm span:nth-child(even) {
  background-color: lightgray;
  display: inline-block;
  width: 0.8ch;
}
.bkm-info--history {
  color: white;
  background-color: fuchsia;
}
.bkm-info--separator {
  background-color: #DAF7A6;
  border: solid 1px yellow;
}
.bkm-info--separator:active {
  transform: translateY(0.1ch);
}
.bkm-info--title {
  padding-left: 0.5ch;
  color: black;
  background: lavender;
}

.bkm-info--tag {
  padding-left: 0.7ch;
  position: relative;
  color: black;
  padding-right: ${BROWSER_SPECIFIC.LABEL_RIGHT_PADDING};
  text-wrap: nowrap;
}
.bkm-info--fixed {
  background-color: #40E0D0;
}
.bkm-info--fixed:active:not(.bkm-info--used-tag) {
  transform: translateY(0.1ch);
}
.bkm-info--fixed:hover, .bkm-info--btn-unfix:hover + .bkm-info--fixed {
  max-width: fit-content;
}
.bkm-info--fixed:hover:not(.bkm-info--used-tag), .bkm-info--btn-unfix:hover + .bkm-info--fixed:not(.bkm-info--used-tag) {
  background-color: #00FFFF;
}
.bkm-info--btn-unfix:has( + .bkm-info--fixed:hover) {
  display: flex;
  background-color: #00FF00;
}
.bkm-info--btn-unfix:hover {
  display: flex;
  background-color: #32CD32;
}

.bkm-info--recent {
  background-color: #DAF7A6;
}
.bkm-info--recent:active:not(.bkm-info--used-tag) {
  transform: translateY(0.1ch);
}
.bkm-info--recent:hover, .bkm-info--btn-fix:hover + .bkm-info--recent {
  max-width: fit-content;
}
.bkm-info--recent:hover:not(.bkm-info--used-tag), .bkm-info--btn-fix:hover + .bkm-info--recent:not(.bkm-info--used-tag) {
  background-color: #00FF00;
}
.bkm-info--btn-fix:has(+ .bkm-info--recent:hover) {
  display: flex;
  background-color: #40E0D0;
}
.bkm-info--btn-fix:hover {
  display: flex;
  background-color: #00BFFF;
}

.bkm-info--used-tag {
  color: gray;
}
.bkm-info--last-tag:not(.bkm-info--used-tag) {
  font-weight: 600;
}
`
  );
  
  const dayMS = 86400000;
  const hourMS = 3600000;
  const minMS = 60000;

  function formatPrevVisit (inMS) {
    
    const dif = Date.now() - inMS;

    let result = ''
    const days = Math.floor(dif / dayMS)

    if (days > 0) {
      result = `D ${days}`
    } else {
      const hours = Math.floor(dif / hourMS)

      if (hours > 0) {
        result = `h ${hours}`
      } else {
        const mins = Math.floor(dif / minMS)

        if (mins > 0) {
          result = `m ${mins}`
        } else {
          result = 'm 0'
        }
      }
    }

    return result
  }

  let fullMessage = {};

  async function deleteBookmark(event) {
    log('deleteBookmark 00');
    const bkmId = event?.target?.dataset?.bkmid || event?.target?.parentNode?.dataset?.bkmid;

    if (bkmId) {
      await chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.DELETE_BOOKMARK,
        bkmId,
      });
    }
  }

  async function addBookmark(event) {
    log('addBookmark 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      const isExist = fullMessage.bookmarkInfoList.some((item) => item.parentId === parentId)

      if (!isExist) {
        await chrome.runtime.sendMessage({
          command: EXTENSION_COMMAND_ID.ADD_BOOKMARK,
          parentId,
          url: document.location.href,
          title: document.title,
        });  
      }
    }
  }

  async function fixTag(event) {
    log('fixTag 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      const recentTag = fullMessage.tagList.find((item) => item.parentId === parentId)
      await chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.FIX_TAG,
        parentId,
        title: recentTag.title,
      });
    }
  }
  async function unfixTag(event) {
    log('unfixTag 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      await chrome.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.UNFIX_TAG,
        parentId,
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

  
  async function updateIsShowTagList() {
    log('updateIsShowTagList');
    const before = !!fullMessage.isShowTagList
    fullMessage.isShowTagList = !before
    showBookmarkInfo(fullMessage);

    await chrome.runtime.sendMessage({
      command: EXTENSION_COMMAND_ID.SHOW_TAG_LIST,
      value: !before,
    });
  }

  function showBookmarkInfo(input) {
    const bookmarkInfoList = input.bookmarkInfoList || []
    const showLayer = input.showLayer || 1
    const visitList = input.visitList || []
    const showPreviousVisit = input.showPreviousVisit || SHOW_PREVIOUS_VISIT_OPTION.NEVER
    const isShowTitle = input.isShowTitle || false
    const tagList = input.tagList || []
    const isShowTagList = input.isShowTagList || false
    const tagLength = input.tagLength || 8
    
    log('showBookmarkInfo 00');

    let rootDiv = document.getElementById(bkmInfoRootId);

    if (!rootDiv) {
      log('showBookmarkInfo 22 2');
      const rootStyle = document.createElement('style');
      const textNodeStyle = document.createTextNode(STYLE_ELEMENT);
      rootStyle.appendChild(textNodeStyle);

      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', bkmInfoRootId);

      document.body.insertAdjacentElement('afterbegin', rootStyle);    
      
      const rootStyle2 = document.createElement('style');
      rootStyle2.setAttribute('id', bkmInfoStyle2Id);
      const textNodeStyle2 = document.createTextNode(
        `.bkm-info--tag {
          min-width: ${tagLength}ch;
          max-width: ${tagLength}ch;
        }`
      );
      rootStyle2.appendChild(textNodeStyle2);

      rootStyle.insertAdjacentElement('afterend', rootStyle2);     
      rootStyle2.insertAdjacentElement('afterend', rootDiv);    
    } else {
      const rootStyle2 = document.getElementById(bkmInfoStyle2Id);
      const textNodeStyle2 = document.createTextNode(
        `.bkm-info--tag {
          min-width: ${tagLength}ch;
          max-width: ${tagLength}ch;
        }`
      );
      rootStyle2.replaceChild(textNodeStyle2, rootStyle2.firstChild);
    }

    
    const rawNodeList = rootDiv.childNodes;
    const beforeRawLength = rawNodeList.length;

    const drawList = []
    let prevTitle
    bookmarkInfoList.forEach((value, index) => {
      const { title } = value

      if (isShowTitle && title) {
        if (title !== prevTitle) {
          drawList.push({ type: 'title', value: title })        
          prevTitle = title
        }  
      }
      
      drawList.push({ type: 'bookmark', value, bkmIndex: index })
    })

    const isShowPreviousVisit = showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS 
      || (showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM && bookmarkInfoList.length === 0)

    if (isShowPreviousVisit && visitList.length > 0) {
      const prevVisit = visitList
        .toReversed()
        .map((i) => formatPrevVisit(i))
        .flatMap((value, index, array) => index === 0 || value !== array[index - 1] ? [value]: [])
        .join(", ") 
      drawList.push({ type: 'history', value: prevVisit })
    }

    if (tagList.length > 0) {
      drawList.push({ type: 'separator' })

      if (isShowTagList) {
        tagList.forEach(({ isFixed, isLast, parentId, title, isUsed }) => {
          drawList.push({
            type: isFixed ? 'fixedTag' : 'recentTag',
            value: { parentId, title, isUsed, isLast },
          })
        })
      }
    }

    drawList.forEach(({ type, value, bkmIndex }, index) => {
      const divRow = document.createElement('div');
      divRow.classList.add('bkm-info--row');
      const divL = document.createElement('div');
      divL.classList.add('bkm-info--row-left');
      divRow.appendChild(divL);

      switch (type) {
        case 'bookmark': {
          const { id, fullPathList } = value
          const shortPathList = fullPathList.slice(-showLayer)
          const restPathList = fullPathList.slice(0, -showLayer)
          const restPath = restPathList.concat('').join('/ ')
    
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', bkmIndex % 2 == 0 ? 'bkm-info--bkm-1' : 'bkm-info--bkm-2');
    
          shortPathList[shortPathList.length - 1] = `${shortPathList[shortPathList.length - 1]}`
          const shortPathListWithSeparator = shortPathList
            .slice(0, -1).flatMap((str) => [str, '/ '])
            .concat(shortPathList[shortPathList.length - 1])
          
          shortPathListWithSeparator.forEach((str) => {
            const span = document.createElement('span');
            // createTextNode is safe method for XSS-injection
            // const shortPathList = shortPath.split(/(\/ )/)
            const textNode = document.createTextNode(str);
            span.appendChild(textNode);
            divLabel.appendChild(span);
          })
    
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
          divDelBtn.setAttribute('data-bkmid', id);
          divDelBtn.classList.add('bkm-info--btn', 'bkm-info--btn-del');
    
          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeDel = document.createTextNode('X');
          divDelBtnLetter.appendChild(textNodeDel);
          
          divDelBtn.appendChild(divDelBtnLetter);
          divDelBtn.addEventListener('click', deleteBookmark);
    
          divRow.appendChild(divLabel);
          divRow.appendChild(divDelBtn);
  
          break
        }
        case 'history': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--history');
          divLabel.addEventListener('click', hideBookmarks);
          const textNode = document.createTextNode(`${value}`);
          divLabel.appendChild(textNode);
  
          divRow.appendChild(divLabel);
  
          break
        }
        case 'separator': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--separator');
          divLabel.addEventListener('click', updateIsShowTagList);
          const textNode = document.createTextNode( isShowTagList ? '▴ hide' : '▾ add' );
          divLabel.appendChild(textNode);
          divRow.appendChild(divLabel);

          break
        }
        case 'recentTag': {
          const { parentId, title, isUsed, isLast } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--tag', 'bkm-info--recent');

          if (isUsed) {
            divLabel.classList.toggle('bkm-info--used-tag', isUsed);
          } else {
            divLabel.setAttribute('data-parentid', parentId);
            divLabel.addEventListener('click', addBookmark);
          }

          if (isLast) {
            divLabel.classList.toggle('bkm-info--last-tag', isLast);
          }

          const textNodeLabel = document.createTextNode(`${title}`);
          divLabel.appendChild(textNodeLabel);

          const divDelBtn = document.createElement('div');
          divDelBtn.setAttribute('data-parentid', parentId);
          divDelBtn.classList.add('bkm-info--btn', 'bkm-info--btn-fix');
          divDelBtn.addEventListener('click', fixTag);
    
          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeDel = document.createTextNode('⊙');
          divDelBtnLetter.appendChild(textNodeDel);
          divDelBtn.appendChild(divDelBtnLetter);    

          divRow.appendChild(divDelBtn);
          divRow.appendChild(divLabel);

          break
        }
        case 'fixedTag': {
          const { parentId, title, isUsed, isLast } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--tag', 'bkm-info--fixed');

          if (isUsed) {
            divLabel.classList.toggle('bkm-info--used-tag', isUsed);
          } else {
            divLabel.setAttribute('data-parentid', parentId);
            divLabel.addEventListener('click', addBookmark);
          }

          if (isLast) {
            divLabel.classList.toggle('bkm-info--last-tag', isLast);
          }

          const textNodeLabel = document.createTextNode(`${title}`);
          divLabel.appendChild(textNodeLabel);

          const divDelBtn = document.createElement('div');
          divDelBtn.setAttribute('data-parentid', parentId);
          divDelBtn.classList.add('bkm-info--btn', 'bkm-info--btn-unfix');
          divDelBtn.addEventListener('click', unfixTag);
    
          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeDel = document.createTextNode('X');
          divDelBtnLetter.appendChild(textNodeDel);
          
          divDelBtn.appendChild(divDelBtnLetter);    

          divRow.appendChild(divDelBtn);
          divRow.appendChild(divLabel);

          break
        }
        case 'title': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--title');
          divLabel.addEventListener('click', hideBookmarks);
          const textNode = document.createTextNode(`${value} :title`);
          divLabel.appendChild(textNode);
  
          divRow.appendChild(divLabel);
  
          break
        }
      }
      
      if (index < beforeRawLength) {
        rootDiv.replaceChild(divRow, rawNodeList[index]);
      } else {
        rootDiv.appendChild(divRow);
      }
    })

    let rawListLength = beforeRawLength;
    while (drawList.length < rawListLength) {
      rootDiv.removeChild(rootDiv.lastChild);
      rawListLength -= 1;
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    log('chrome.runtime.onMessage: ', message);
    switch (message.command) {
      case CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO: {
        log('content-script: ', message.bookmarkInfoList);

        fullMessage = { ...fullMessage, ...message }
        showBookmarkInfo(fullMessage);
        break
      }
      case CONTENT_SCRIPT_COMMAND_ID.HISTORY_INFO: {
        log('content-script: ', message.visitList);

        fullMessage = { ...fullMessage, ...message }
        showBookmarkInfo(fullMessage);
        break
      }
      case CONTENT_SCRIPT_COMMAND_ID.CLEAR_URL: {
        log('content-script:', message.cleanUrl);
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
      command: EXTENSION_COMMAND_ID.TAB_IS_READY,
      url: document.location.href,
    });
    log('after send contentScriptReady');
  } catch (er) {
    log('IGNORE send contentScriptReady', er);
  }

  function fullscreenchanged() {
    let rootDiv = document.getElementById(bkmInfoRootId);

    if (rootDiv) {
      if (document.fullscreenElement) {
        rootDiv.style = 'display:none;';      
      } else {
        rootDiv.style = 'display:block;';
      }
    }
  }
  
  document.addEventListener("fullscreenchange", fullscreenchanged);
})();
