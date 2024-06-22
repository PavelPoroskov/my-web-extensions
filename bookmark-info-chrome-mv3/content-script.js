let SHOW_LOG = false
// SHOW_LOG = true
const log = SHOW_LOG ? console.log : () => {};

(async function() {
  log('IN content-script');

  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

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
    history: [
      'padding-left: 0.7ch',
      'border-top-left-radius: 0.5lh 50%',
      'border-bottom-left-radius: 0.5lh 50%',
      'color: white',
      'background-color: fuchsia',
      'position: relative',
    ].join(';'),
    title: [
      'padding-left: 0.5ch',
      'color: black',
      'background: lavender',
    ].join(';'),
    separator: [
      'background-color: transparent',
    ].join(';'),
    fixedTag: [
      'padding-left: 0.7ch',
      'border-top-left-radius: 0.5lh 50%',
      'border-bottom-left-radius: 0.5lh 50%',
      'color: black',
      'background-color: #0ACAD0',
    ].join(';'),
    recentTag: [
      'padding-left: 0.7ch',
      'border-top-left-radius: 0.5lh 50%',
      'border-bottom-left-radius: 0.5lh 50%',
      'color: black',
      'background-color: #13D44D',
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
.bkmLabel span:nth-child(even) {
  background-color: lightgray;
  display: inline-block;
  width: 0.8ch;
}
.fixedTag:hover {
  background-color: #A7FAF8;
}
.fixedTag:active {
  transform: translateY(0.1ch);
}
.recentTag:hover {
  background-color: #B5FDC9;
}
.recentTag:active {
  transform: translateY(0.1ch);
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

  async function addTag(event) {
    log('addTag 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      await chrome.runtime.sendMessage({
        command: "addTag",
        parentId,
        url: document.location.href,
        title: document.title,
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

  function showBookmarkInfo(input) {
    const bookmarkInfoList = input.bookmarkInfoList || []
    const showLayer = input.showLayer || 1
    const visitList = input.visitList || []
    const showPreviousVisit = input.showPreviousVisit || SHOW_PREVIOUS_VISIT_OPTION.NEVER
    const isShowTitle = input.isShowTitle || false
    const fixedTagList = input.fixedTagList || []
    const recentTagList = input.recentTagList || []

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
      
      drawList.push({ type: 'bookmark', value, color: colors[index % 2] })
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

    if (fixedTagList.length > 0 || recentTagList.length > 0) {
      drawList.push({ type: 'separator' })

      fixedTagList.forEach((value) => {
        drawList.push({ type: 'fixedTag', value })
      })
      recentTagList.forEach((value) => {
        drawList.push({ type: 'recentTag', value })
      })
    }

    drawList.forEach(({ type, value, color }, index) => {
      const divRow = document.createElement('div');
      divRow.style = STYLE.row;
      const divL = document.createElement('div');
      divL.style = STYLE.rowLeft;
      divRow.appendChild(divL);

      switch (type) {
        case 'bookmark': {
          const { id, fullPathList } = value
          const shortPathList = fullPathList.slice(-showLayer)
          const restPathList = fullPathList.slice(0, -showLayer)
          const restPath = restPathList.concat('').join('/ ')
    
          const divLabel = document.createElement('div');
          divLabel.style = `${STYLE.label};background-color:${color}`;
          divLabel.classList.add('bkmLabel');
    
          shortPathList[shortPathList.length - 1] = `${shortPathList[shortPathList.length - 1]} :bkm`
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
          divDelBtn.style = STYLE.delBtn;
          divDelBtn.setAttribute('data-bkmid', id);
          divDelBtn.classList.add('bkmDelBtn');
    
          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.style = STYLE.delBtnLetter;
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
          divLabel.style = STYLE.history;
          divLabel.addEventListener('click', hideBookmarks);
          const textNode = document.createTextNode(`${value} :prev. visit`);
          divLabel.appendChild(textNode);
  
          divRow.appendChild(divLabel);
  
          break
        }
        case 'separator': {
          const divLabel = document.createElement('div');
          divLabel.style = STYLE.separator;
          const textNode = document.createTextNode(' ');
          divLabel.appendChild(textNode);
          divRow.appendChild(divLabel);

          break
        }
        case 'recentTag': {
          const { title, parentId } = value
          const divContainer = document.createElement('div');
          divContainer.setAttribute('data-parentid', parentId);

          const btnFix = document.createElement('div');
          divLabel.addEventListener('click', fixTag);
          const textNodeFix = document.createTextNode('fix');
          btnFix.appendChild(textNodeFix)

          const divLabel = document.createElement('div');
          divLabel.style = STYLE.recentTag;
          divLabel.addEventListener('click', addTag);
          const textNodeLabel = document.createTextNode(`${title} :tag`);
          divLabel.appendChild(textNodeLabel);
  
          divContainer.appendChild(btnFix)
          divContainer.appendChild(divLabel)
          divRow.appendChild(divContainer);

          break
        }
        case 'fixedTag': {
          const { label, id } = value
          const divLabel = document.createElement('div');
          divLabel.style = STYLE.fixedTag;
          divLabel.setAttribute('data-parentid', id);
          divLabel.addEventListener('click', addTag);
          const textNode = document.createTextNode(`${label} :tag`);
          divLabel.appendChild(textNode);
  
          divRow.appendChild(divLabel);
          break
        }
        case 'title': {
          const divLabel = document.createElement('div');
          divLabel.style = STYLE.title;
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

  let prevMessage = {};

  async function fixTag(event) {
    log('fixTag 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      const recentTag = prevMessage.recentTagList.find((item) => item.parentId === parentId)
      await chrome.runtime.sendMessage({
        command: "fixTag",
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
        command: "unfixTag",
        parentId,
      });
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    log('chrome.runtime.onMessage: ', message);
    switch (message.command) {
      case "bookmarkInfo": {
        log('content-script: ', message.bookmarkInfoList);

        prevMessage = { ...prevMessage, ...message }
        showBookmarkInfo(prevMessage);
        break
      }
      case "visitInfo": {
        log('content-script: ', message.visitList);

        prevMessage = { ...prevMessage, ...message }
        showBookmarkInfo(prevMessage);
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
