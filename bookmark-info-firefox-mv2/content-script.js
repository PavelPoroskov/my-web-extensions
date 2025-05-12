(async function() {
  let SHOW_LOG = false
  // SHOW_LOG = true
  const log = SHOW_LOG ? console.log : () => {};
  log('IN content-script 00');

  if (window.gHasRunBkmInfScript) {
    return;
  }
  window.gHasRunBkmInfScript = true;

  // TODO-DOUBLE remove duplication in EXTENSION_MSG_ID: message-id.js and content-scripts.js
  const EXTENSION_MSG_ID = {
    ADD_BOOKMARK_FOLDER_BY_ID: 'ADD_BOOKMARK_FOLDER_BY_ID',
    ADD_BOOKMARK_FOLDER_BY_NAME: 'ADD_BOOKMARK_FOLDER_BY_NAME',
    DELETE_BOOKMARK: 'DELETE_BOOKMARK',
    FIX_TAG: 'FIX_TAG',
    UNFIX_TAG: 'UNFIX_TAG',
    PAGE_EVENT: 'PAGE_EVENT',
    TAB_IS_READY: 'TAB_IS_READY',
    SHOW_TAG_LIST: 'SHOW_TAG_LIST',
    UPDATE_AVAILABLE_ROWS: 'UPDATE_AVAILABLE_ROWS',
    RESULT_AUTHOR: 'RESULT_AUTHOR',
  }
  // TODO-DOUBLE remove duplication in CONTENT_SCRIPT_MSG_ID: message-id.js and content-scripts.js
  const CONTENT_SCRIPT_MSG_ID = {
    BOOKMARK_INFO: 'BOOKMARK_INFO',
    // HISTORY_INFO: 'HISTORY_INFO',
    // TAGS_INFO: 'TAGS_INFO',
    CHANGE_URL: 'CHANGE_URL',
    TOGGLE_YOUTUBE_HEADER: 'TOGGLE_YOUTUBE_HEADER',
    GET_USER_INPUT: 'GET_USER_INPUT',
    GET_SELECTION: 'GET_SELECTION',
    REPLACE_URL: 'REPLACE_URL',
    SEND_ME_AUTHOR: 'SEND_ME_AUTHOR',
  }

  // TODO-DOUBLE remove duplication BROWSER in browser-specific.js and content-scripts.js
  const BROWSER_OPTIONS = {
    CHROME: 'CHROME',
    FIREFOX: 'FIREFOX',
  }
  const BROWSER_SPECIFIC_OPTIONS = {
    DEL_BTN_RIGHT_PADDING: {
      [BROWSER_OPTIONS.CHROME]: '0.5ch',
      [BROWSER_OPTIONS.FIREFOX]: '1.5ch'
    },
    LABEL_RIGHT_PADDING: {
      [BROWSER_OPTIONS.CHROME]: '0.3ch',
      [BROWSER_OPTIONS.FIREFOX]: '0.6ch'
    }
  }
  const BROWSER = BROWSER_OPTIONS.FIREFOX;
  const BROWSER_SPECIFIC = Object.fromEntries(
    Object.entries(BROWSER_SPECIFIC_OPTIONS)
      .map(([option, obj]) => [option, obj[BROWSER]])
  );
  const TAG_LIST_OPEN_MODE_OPTIONS = {
    GLOBAL: 'GLOBAL',
    PER_PAGE: 'PER_PAGE',
    CLOSE_AFTER_ADD: 'CLOSE_AFTER_ADD',
  }

  const bkmInfoRootId = 'bkm-info--root';
  const bkmInfoStyleId = 'bkm-info--style';

  function getStyleText({ fontSize, fontSizeLetter, tagLength, onPrint }) {

    return (
`
#bkm-info--root {
  --bkm-info-font-size: ${fontSize}px;
  --bkm-info-font-letter: ${fontSizeLetter}px;
  --bkm-info-tag-length: ${tagLength}ch;
  --bkm-info-label-rpad: ${BROWSER_SPECIFIC.LABEL_RIGHT_PADDING};
  --bkm-info-del-rpad: ${BROWSER_SPECIFIC.DEL_BTN_RIGHT_PADDING};
  --bkm-info-onprint: ${onPrint};

  font-size: var(--bkm-info-font-size);
  width: var(--bkm-info-tag-length);
}
.bkm-info--tag {
  min-width: var(--bkm-info-tag-length);
  max-width: var(--bkm-info-tag-length);
}
.bkm-info--btn-letter {
  font-size: var(--bkm-info-font-letter);
}
#bkm-info--root {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 2147483646;
  background-color: transparent;
  font-family: sans-serif !important;
  font-weight: normal;
  user-select: none;
  max-height: 100vh;
  overflow-y: clip;
  text-align: left;
  line-height: 1.2;
  letter-spacing: normal;
  margin: 0;
}
#bkm-info--root * {
  box-sizing: border-box;
}
@media print {
  #bkm-info--root {
      display: none;
  }
}
.bkm-info--row {
  display: flex;
  position: relative;
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
  justify-content: flex-end;
}
.bkm-info--label-container {
  display: flex;
  position: relative;
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
  justify-content: flex-end;
}
.bkm-info--label {
  padding-left: 0.7ch;
  border-top-left-radius: 0.5lh 50%;
  border-bottom-left-radius: 0.5lh 50%;
  position: relative;
  color: black;
  padding-right: var(--bkm-info-label-rpad);
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
  width: fit-content;
  text-wrap: nowrap;
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
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
}
.bkm-info--btn-letter {
  color: white;
  line-height: 1;
  font-family: inherit !important;
  margin: inherit;
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
.bkm-info--author {
  background-color: bisque;
}
.bkm-info--btn-del {
  padding-right: var(--bkm-info-del-rpad);
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
.bkm-info--empty {
  color: transparent;
  background-color: transparent;
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
  width: fit-content;
  text-wrap: nowrap;
  line-height: inherit;
  margin: inherit;
}

.bkm-info--tag {
  padding-left: 0.7ch;
  position: relative;
  color: black;
  padding-right: var(--bkm-info-label-rpad);
  text-wrap: nowrap;
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
  background-color: #DAF7A6;
}
.bkm-info--tag:active {
  transform: translateY(0.1ch);
}
.bkm-info--tag:hover, .bkm-info--btn-fix:hover + .bkm-info--tag, .bkm-info--btn-unfix:hover + .bkm-info--tag {
  max-width: fit-content;
}
.bkm-info--tag:hover:not(.bkm-info--used-tag), .bkm-info--btn-fix:hover + .bkm-info--tag:not(.bkm-info--used-tag), .bkm-info--btn-unfix:hover + .bkm-info--tag:not(.bkm-info--used-tag) {
  background-color: #00FF00;
}
.bkm-info--btn-fix:has(+ .bkm-info--tag:hover) {
  display: flex;
  background-color: #40E0D0;
}
.bkm-info--btn-fix:hover {
  display: flex;
  background-color: #00BFFF;
}
.bkm-info--btn-unfix:has( + .bkm-info--tag:hover) {
  display: flex;
  background-color: #32CD32;
}
.bkm-info--btn-unfix:hover {
  display: flex;
  background-color: #00FF00;
}
.bkm-info--used-tag {
  color: gray;
}
.bkm-info--last-tag:not(.bkm-info--used-tag) {
  font-weight: 600;
}
.bkm-info--tag span {
  background-color: white;
  display: inline-block;
  padding-left: 0.5ch;
}
.bkm-info--tag:hover span {
  background-color: transparent;
}
.bkm-info--fix-mark {
  width: 0;
  height: 0;
  border-bottom: 0.5em solid #40E0D0;
  border-right: 0.5em solid transparent;
  position: absolute;
  left: 0;
  bottom: 0;
}
.bkm-info--tag:hover .bkm-info--fix-mark {
  border-bottom: 0.5em solid darkgray;
}
@media print {
  header, footer, aside, nav {
      display: var(--bkm-info-onprint);
  }
  .blockSpoiler, .blockSpoiler-content {
    display: var(--bkm-info-onprint);
  }
}
`
    )
  };

  function hideBookmarks() {
    const rootDiv = document.getElementById(bkmInfoRootId);

    if (rootDiv) {
      while (rootDiv.lastChild) {
        rootDiv.removeChild(rootDiv.lastChild);
      }
    }
  }

  const availableActionSet = new Set(['b', 'db', 'pb', 'h', 'tgl', 't', 'ut', 'fx', 'uf'])
  async function rootListener(event) {
    const actionId = event?.target?.dataset?.id || event?.target?.parentNode?.dataset?.id;
    if (!actionId) {
      return
    }

    const [action, id] = actionId.split('#')
    // if (!id) {
    //   return
    // }
    if (!availableActionSet.has(action)) {
      return
    }
    event.stopPropagation()

    switch (action) {
      // onBookmarkLabelClick
      case 'pb':
      case 'b': {
        hideBookmarks()
        break
      }
      case 'db': {
        const bookmarkId = id
        if (!bookmarkId) {
          break
        }

        // optimistic ui
        const fullState = stateContainer.getState()
        const bookmarkList = fullState.bookmarkList || []

        const findIndex = bookmarkList.findIndex((item) => item.id == bookmarkId)
        if (-1 < findIndex) {
          const newBookmarkList = bookmarkList.with(findIndex, { optimisticDel: true })
          stateContainer.update({ bookmarkList: newBookmarkList })
        }

        await browser.runtime.sendMessage({
          command: EXTENSION_MSG_ID.DELETE_BOOKMARK,
          bookmarkId,
        });
        break
      }
      case 'h': {
        hideBookmarks()
        break
      }
      case 'tgl': {
        const fullMessage = stateContainer.getState()
        const tagListOpenMode = fullMessage.tagListOpenMode

        if (tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL) {
          const before = !!fullMessage.isTagListOpenGlobal
          stateContainer.update({ isTagListOpenGlobal: !before })
          await browser.runtime.sendMessage({
            command: EXTENSION_MSG_ID.SHOW_TAG_LIST,
            value: !before,
          });
        } else {
          const before = !!fullMessage.isTagListOpenLocal
          stateContainer.update({ isTagListOpenLocal: !before })
        }
        break
      }
      case 't': {
        const parentId = id
        const fullState = stateContainer.getState()
        const bookmarkList = fullState.bookmarkList || []

        // optimistic ui
        const tagList = fullState.tagList || []
        const tag = tagList.find((item) => item.parentId === parentId)
        if (tag) {
          const newBookmarkList = bookmarkList.concat({
            id: '',
            title: document.title,
            parentTitle: tag.parentTitle,
            path: '',
            parentId,
            optimisticAdd: true,
          })
          const update = { bookmarkList: newBookmarkList }

          if (fullState.optimisticAddFromTagList < fullState.optimisticDelFromTagList) {
            Object.assign(update, { optimisticAddFromTagList: fullState.optimisticAddFromTagList + 1 })
          }
          if (fullState.tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.CLOSE_AFTER_ADD) {
            Object.assign(update, {
              isTagListOpenLocal: false,
              optimisticDelFromTagList: 0,
              optimisticAddFromTagList: 0,
              optimisticToStorageDel: 0,
              optimisticToStorageAdd: 0,
            })
          }
          stateContainer.update(update)
        }
        await browser.runtime.sendMessage({
          command: EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_ID,
          parentId,
          url: document.location.href,
          title: document.title,
        });
        break
      }
      case 'ut': {
        const parentId = id
        const fullState = stateContainer.getState()
        const bookmarkList = fullState.bookmarkList || []
        const bkm = bookmarkList.find((item) => item.parentId === parentId)

        if (bkm?.id) {
          // epic error
          // const findIndex = bookmarkList.findIndex((item) => item.id != bkm.id)
          const findIndex = bookmarkList.findIndex((item) => item.id == bkm.id)
          if (-1 < findIndex) {
            const newBookmarkList = bookmarkList.with(findIndex, { optimisticDel: true })
            stateContainer.update({
              bookmarkList: newBookmarkList,
              optimisticDelFromTagList: fullState.optimisticDelFromTagList + 1,
            })
          }

          await browser.runtime.sendMessage({
            command: EXTENSION_MSG_ID.DELETE_BOOKMARK,
            bookmarkId: bkm.id,
          });
        }
        break
      }
      case 'fx': {
        const parentId = id
        const fullState = stateContainer.getState()
        const tagList = fullState.tagList || []

        let tag
        const findIndex = tagList.findIndex((item) => item.parentId == parentId)
        if (-1 < findIndex) {
          tag = tagList[findIndex]
          const newTagList = tagList.with(findIndex, { ...tag, isFixed: true })
          stateContainer.update({ tagList: newTagList })
        }

        await browser.runtime.sendMessage({
          command: EXTENSION_MSG_ID.FIX_TAG,
          parentId,
          parentTitle: tag?.parentTitle,
        });
        break
      }
      case 'uf': {
        const parentId = id
        const fullState = stateContainer.getState()
        const tagList = fullState.tagList || []

        let tag
        const findIndex = tagList.findIndex((item) => item.parentId == parentId)
        if (-1 < findIndex) {
          tag = tagList[findIndex]
          const newTagList = tagList.with(findIndex, { ...tag, isFixed: false, ageIndex: 0 })
          stateContainer.update({ tagList: newTagList })
        }

        await browser.runtime.sendMessage({
          command: EXTENSION_MSG_ID.UNFIX_TAG,
          parentId,
        });
        break
      }
    }
  }

  function filterTagList({ tagList, nAvailableRows, nUsedRows }) {
    log('filterTagList ', tagList)
    if (!nAvailableRows) {
      return tagList
    }

    const nAvailableTags = Math.max(0, nAvailableRows - nUsedRows)
    if (nAvailableTags == 0) {
      return []
    }

    if (tagList.length <= nAvailableTags) {
      return tagList
    }

    const nFixedTags = tagList.filter(({ isFixed }) => isFixed).length
    const nAvailableRecentTags = nAvailableTags - nFixedTags

    const resultList = []
    let lostHighlight
    let nVisible = 0
    let iWhile = 0
    while (nVisible < nAvailableTags && iWhile < tagList.length) {
      const item = tagList[iWhile]
      iWhile += 1
      const { isHighlight, parentTitle } = item
      // ageIndex: 0..m, 0 - the most recent
      const isVisible = item.isFixed || item.ageIndex < nAvailableRecentTags

      if (!isVisible) {
        if (isHighlight) {
          lostHighlight = new Intl.Segmenter().segment(parentTitle).containing(0).segment.toUpperCase()
        }
        continue
      }

      nVisible += 1
      let isMoveHighlight = false
      if (lostHighlight) {
        const currentLetter = new Intl.Segmenter().segment(parentTitle).containing(0).segment.toUpperCase()
        isMoveHighlight = currentLetter == lostHighlight
        lostHighlight = undefined
      }

      const newItem = Object.assign({}, item)
      if (isMoveHighlight) {
        Object.assign(newItem, { isHighlight: 1 })
      }
      resultList.push(newItem)
    }

    return resultList
  }
  function renderBookmarkInfo(input, prevState) {
    log('renderBookmarkInfo 00');

    const bookmarkList = (input.bookmarkList || [])
      .filter(({ optimisticDel }) => !optimisticDel)

    const partialBookmarkList = input.partialBookmarkList || []
    const authorBookmarkList = input.authorBookmarkList || []

    const visitString = input.visitString || ''
    const isShowTitle = input.isShowTitle || false
    const isTagListAvailable = input.isTagListAvailable || false
    const tagList = input.tagList || []
    const tagListOpenMode = input.tagListOpenMode
    const isTagListOpen = tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL
      ? (input.isTagListOpenGlobal || false)
      : (input.isTagListOpenLocal || false)

    const optimisticDelFromTagList = input.optimisticDelFromTagList
    const optimisticAddFromTagList = input.optimisticAddFromTagList

    const fontSize = input.fontSize
    const tagLength = input.tagLength
    const isHideSemanticHtmlTagsOnPrinting = input.isHideSemanticHtmlTagsOnPrinting
    const fontSizeLetter = Math.floor(10/14*(+fontSize))
    const onPrint = isHideSemanticHtmlTagsOnPrinting ? 'none' : 'unset'

    let rootStyle = document.getElementById(bkmInfoStyleId);
    let rootDiv = document.getElementById(bkmInfoRootId);
    if (!rootStyle) {
      const rootStyle = document.createElement('style');
      rootStyle.setAttribute('id', bkmInfoStyleId);
      const textNodeStyle = document.createTextNode(
        getStyleText({ fontSize, fontSizeLetter, tagLength, onPrint })
      );
      rootStyle.appendChild(textNodeStyle);

      document.body.insertAdjacentElement('afterbegin', rootStyle);

      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', bkmInfoRootId);
      rootDiv.addEventListener('click', rootListener, { capture: true });
      rootStyle.insertAdjacentElement('afterend', rootDiv);
    }

    if (fontSize != prevState.fontSize) {
      rootDiv.style.setProperty("--bkm-info-font-size", fontSize);
      rootDiv.style.setProperty("--bkm-info-font-letter", fontSizeLetter);
    }
    if (tagLength != prevState.tagLength) {
      rootDiv.style.setProperty("--bkm-info-tag-length", tagLength);
    }
    if (isHideSemanticHtmlTagsOnPrinting != prevState.isHideSemanticHtmlTagsOnPrinting) {
      rootDiv.style.setProperty("--bkm-info-onprint", onPrint);
    }

    const usedParentIdSet = new Set(bookmarkList.map(({ parentId }) => parentId))
    let nTagListAvailableRows = input.nTagListAvailableRows
    if (rootDiv.firstChild) {
      const viewportHeight = window.visualViewport.height || window.innerHeight
      // const rowHeight = rootDiv.firstChild.clientHeight
      const rowHeight = rootDiv.firstChild.getBoundingClientRect().height

      if (rowHeight) {
        nTagListAvailableRows = Math.floor(viewportHeight / rowHeight)
      }
    }

    const drawList = []
    let prevTitle
    bookmarkList.forEach((value, index) => {
      const { title } = value

      if (isShowTitle && title) {
        if (title !== prevTitle) {
          drawList.push({ type: 'title', value: title })
          prevTitle = title
        }
      }

      drawList.push({ type: 'bookmark', value, bkmIndex: index })
    })
    partialBookmarkList.forEach((value, index) => {
      drawList.push({ type: 'partial-bookmark', value, bkmIndex: index + bookmarkList.length })
    })
    authorBookmarkList.forEach((value) => {
      drawList.push({ type: 'author-bookmark', value })
    })

    if (isTagListAvailable) {
    //if (tagList.length > 0 && isTagListOpen) {
      const emptySlotsForDel = Math.max(0, optimisticDelFromTagList - optimisticAddFromTagList)
      const emptySlotsForAdd = Math.max(0, 2 - bookmarkList.length - partialBookmarkList.length - authorBookmarkList.length - emptySlotsForDel)
      const emptySlots = emptySlotsForAdd + emptySlotsForDel

      for (let iEmpty = 0; iEmpty < emptySlots; iEmpty += 1) {
        drawList.push({ type: 'emptySlot' })
      }
    }

    if (visitString) {
      drawList.push({ type: 'history', value: visitString })
    }

    if (isTagListAvailable) {
      drawList.push({ type: 'separator' })

      if (isTagListOpen) {
        const filteredTagList = filterTagList({
          tagList,
          nAvailableRows: nTagListAvailableRows,
          nUsedRows: drawList.length,
        })

        filteredTagList.forEach((tag) => {
          drawList.push({
            type: 'tag',
            value: {
              ...tag,
              isUsed: usedParentIdSet.has(tag.parentId)
            },
          })
        })
      }
    }

    const rawNodeList = rootDiv.childNodes;
    const beforeRawLength = rawNodeList.length;

    drawList.forEach(({ type, value, bkmIndex }, index) => {
      let divRow

      switch (type) {
        case 'bookmark': {
          const { id, path, parentTitle } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', bkmIndex % 2 == 0 ? 'bkm-info--bkm-1' : 'bkm-info--bkm-2');
          const textNode = document.createTextNode(parentTitle);
          divLabel.appendChild(textNode);
          divLabel.setAttribute('data-restpath', path);

          // TODO sanitize: remove ",<,>
          // const sanitizedFullPath = fullPath
          //   .replaceAll('"', '&quot;')
          //   .replaceAll('>', '&gt;')
          //   .replaceAll('<', '&lt;')
          // divLabel.setAttribute('data-restpath', sanitizedFullPath);
          //
          // Symbols ( " > < ) don't break html and displayed as text.
          divLabel.setAttribute('data-id', `b#${id}`);

          const divDelBtn = document.createElement('div');
          divDelBtn.setAttribute('data-id', `db#${id}`);
          divDelBtn.classList.add('bkm-info--btn', 'bkm-info--btn-del');

          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeDel = document.createTextNode('X');
          divDelBtnLetter.appendChild(textNodeDel);

          divDelBtn.appendChild(divDelBtnLetter);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);
          divLabelContainer.appendChild(divDelBtn);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'partial-bookmark': {
          // TODO? go to original bookmark
          const { id, parentTitle, url } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', bkmIndex % 2 == 0 ? 'bkm-info--bkm-1' : 'bkm-info--bkm-2');

          const textNode = document.createTextNode(`url*: ${parentTitle}`);
          divLabel.appendChild(textNode);
          divLabel.setAttribute('data-restpath', `url*: ${url}`);
          divLabel.setAttribute('data-id', `pb#${id}`);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'author-bookmark': {
          const { id, parentTitle, url } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', 'bkm-info--author');

          const textNode = document.createTextNode(`author: ${parentTitle}`);
          divLabel.appendChild(textNode);
          divLabel.setAttribute('data-restpath', url);
          divLabel.setAttribute('data-id', `h#${id}`);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'emptySlot': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--empty');
          const textNode = document.createTextNode('|');
          divLabel.setAttribute('data-id', 'h#1');
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.setAttribute('data-id', 'h#1');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'history': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--history');
          divLabel.setAttribute('data-id', 'h#1');
          const textNode = document.createTextNode(`${value}`);
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.setAttribute('data-id', 'h#1');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'separator': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--separator');
          divLabel.setAttribute('data-id', 'tgl#1');
          const textNode = document.createTextNode( isTagListOpen ? '▴ hide' : '▾ add' );
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'tag': {
          const { parentId, parentTitle, isUsed, isLast, isFixed, isHighlight } = value
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--tag');

          if (isUsed) {
            divLabel.setAttribute('data-id', `ut#${parentId}`);
          } else {
            divLabel.setAttribute('data-id', `t#${parentId}`);
          }

          divLabel.classList.toggle('bkm-info--used-tag', isUsed);
          divLabel.classList.toggle('bkm-info--last-tag', isLast);

          if (isFixed) {
            const divTri = document.createElement('div');
            divTri.classList.add('bkm-info--fix-mark');
            divLabel.appendChild(divTri);
          }

          if (isHighlight) {
            const Segmenter = new Intl.Segmenter();
            const arLetters = Array.from(Segmenter.segment(parentTitle));
            const firstLetter = arLetters[0].segment
            const restLetters = arLetters.slice(1).map(({ segment }) => segment).join('')

            const elSpan = document.createElement('span');
            const textNode1 = document.createTextNode(firstLetter.toUpperCase());
            elSpan.appendChild(textNode1);
            divLabel.appendChild(elSpan);
            divLabel.style = 'padding-left: 0.2ch'

            const textNodeLabel = document.createTextNode(restLetters);
            divLabel.appendChild(textNodeLabel);
          } else {
            const textNodeLabel = document.createTextNode(`${parentTitle}`);
            divLabel.appendChild(textNodeLabel);
          }

          const divFixBtn = document.createElement('div');
          if (isFixed) {
            divFixBtn.classList.add('bkm-info--btn', 'bkm-info--btn-unfix');
            divFixBtn.setAttribute('data-id', `uf#${parentId}`);

            const divFixBtnLetter = document.createElement('div');
            divFixBtnLetter.classList.add('bkm-info--btn-letter');
            const textNodeFix = document.createTextNode('X');

            divFixBtnLetter.appendChild(textNodeFix);
            divFixBtn.appendChild(divFixBtnLetter);
          } else {
            divFixBtn.classList.add('bkm-info--btn', 'bkm-info--btn-fix');
            divFixBtn.setAttribute('data-id', `fx#${parentId}`);

            const divFixBtnLetter = document.createElement('div');
            divFixBtnLetter.classList.add('bkm-info--btn-letter');
            const textNodeFix = document.createTextNode('⊙');
            divFixBtnLetter.appendChild(textNodeFix);
            divFixBtn.appendChild(divFixBtnLetter);
          }

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divFixBtn);
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          if (isUsed) {
            divRow.setAttribute('data-id', `ut#${parentId}`);
          } else {
            divRow.setAttribute('data-id', `t#${parentId}`);
          }

          break
        }
        case 'title': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--title');
          divLabel.setAttribute('data-id', 'h#1');
          const textNode = document.createTextNode(`${value} :title`);
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

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

    if (rootDiv.firstChild) {
      const viewportHeight = window.visualViewport.height || window.innerHeight
      const rowHeight = rootDiv.firstChild.getBoundingClientRect().height

      if (rowHeight) {
        const availableRows = Math.floor(viewportHeight / rowHeight)

        if (availableRows != input.nTagListAvailableRows) {
          updateAvailableRowsInExtension(availableRows)
        }
      }
    }
  }

  async function updateAvailableRowsInExtension(availableRows) {
    await browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.UPDATE_AVAILABLE_ROWS,
      value: availableRows,
    });
  }

  class TaskQueue {
    queue = []
    nRunningTask = 0
    concurrencyLimit = 1

    constructor() {}

    _run() {
      if (this.nRunningTask >= this.concurrencyLimit || this.queue.length === 0) {
        return;
      }

      this.nRunningTask++;
      const task = this.queue.shift();
      if (task) {
        task();
      }
      this.nRunningTask--;

      this._run();
    }

    enqueue(task) {
      this.queue.push(task);
      this._run();
    }
  }

  class StateContainer {
    state = {}
    updates = []
    // nUpdates = 0
    // nReadUpdates = 0

    afterUpdateAction

    constructor(initialState) {
      this.state = initialState
      this.updates = []
    }
    setAfterUpdateAction(action) {
      this.afterUpdateAction = action
    }
    update(updateObj) {
      // this.nUpdates = this.nUpdates + 1
      //Object.assign(this.state, updateObj)
      this.updates.push(updateObj)

      if (this.afterUpdateAction) {
        this.afterUpdateAction()
      }
    }
    updateNoRender(updateObj) {
      //this.updates.push(updateObj)
      Object.assign(this.state, updateObj)
    }
    getState() {
      return { ...this.state }
    }
    readUpdates() {
      // const isUpdates = this.nReadUpdates < this.nUpdates
      // this.nReadUpdates = this.nUpdates

      const isUpdates = 0 < this.updates.length
      let prevState

      if (isUpdates) {
        let sumUpdate = {}
        let step = this.updates.shift()
        while (step) {
          Object.assign(sumUpdate, step)
          step = this.updates.shift()
        }

        // const isUpdates = Object.keys(sumUpdate).length > 0
        prevState = {
          fontSize: this.state.fontSize,
          tagLength: this.state.tagLength,
          isHideSemanticHtmlTagsOnPrinting: this.state.isHideSemanticHtmlTagsOnPrinting,
        }
        Object.assign(this.state, sumUpdate)
      }

      return {
        isUpdates,
        state: isUpdates ? this.state : undefined,
        prevState,
      }
    }
  }
  const stateContainer = new StateContainer({
    optimisticDelFromTagList: 0,
    optimisticAddFromTagList: 0,
    optimisticToStorageDel: 0,
    optimisticToStorageAdd: 0,
    fontSize: 14,
    tagLength: 15,
    isHideSemanticHtmlTagsOnPrinting: false,
  })
  const renderQueue = new TaskQueue()
  stateContainer.setAfterUpdateAction(() => {
    const callback = () => {
      renderQueue.enqueue(() => {
        const { isUpdates, state, prevState } = stateContainer.readUpdates()
        if (isUpdates) {
          renderBookmarkInfo(state, prevState)
        }
      })
    }

    // requestAnimationFrame(callback)
    Promise.resolve()
      .then(callback)
      .catch((err) => {
        log('error on render', err)
      })
    //setTimeout(callback, 0)
  })

  // const v = localStorage.getItem("BkmkInfoGlobalOptions-isHideHeaderForYoutube");
  const options = {}
  if (document.location.hostname.endsWith('youtube.com')) {
    const v = document.cookie.split(";").some((item) => item.includes('isHideHeaderForYoutube=true'))
    options.isHideHeaderForYoutube = v
  }
  log('## after options = ', options);

  let cToggleYoutubePageHeader = 0
  let ytHeaderPadding
  // eslint-disable-next-line no-unused-vars
  let ytTimerId

  function toggleYoutubePageHeaderInDom() {
    const ytDiv = document.querySelector('#page-header-container');
    log('toggleYoutubePageHeaderInDom() 00 ytDiv', ytDiv?.id, ytDiv);

    if (ytDiv) {
      const isShowNow = !ytDiv.style.display
      const isShowNeed = cToggleYoutubePageHeader % 2 == 1
      log('isHideHeaderForYoutube 11', {
        'ytDiv.style.display': ytDiv.style.display,
        isShowNow,
        isShowNeed
      });

      if (isShowNow != isShowNeed) {
        const ytDiv2 = document.querySelector('div.tp-yt-app-header-layout:nth-child(2)');

        if (isShowNeed) {
          log('isHideHeaderForYoutube 22 show');
          ytDiv.style.removeProperty('display')
          ytDiv2.style['padding-top'] = ytHeaderPadding || '473px'
        } else {
          log('isHideHeaderForYoutube 22 hide');
          ytDiv.style = 'display: none;'
          ytHeaderPadding = ytDiv2.style['padding-top']
          ytDiv2.style = 'padding-top: 48px;'
        }
      }
    }
  }

  function toggleYoutubePageHeader({ nTry } = { nTry: 1 }) {
    log('toggleYoutubePageHeader() 00', nTry);
    const ytDiv = document.querySelector('#page-header-container');
    const restNTry = nTry - 1

    if (ytDiv) {
      toggleYoutubePageHeaderInDom()
      options.isStartedToggleYoutubePageHeader = false
    } else {
      log('isHideHeaderForYoutube 00 nTry', nTry, 'empty ytDiv');
      if (restNTry > 0) {
        log('isHideHeaderForYoutube 00 set timeout 200');
        ytTimerId = setTimeout(
          () => {
            toggleYoutubePageHeader({ nTry: restNTry })
          },
          200,
        )
      }
    }
  }
  function startHideYoutubePageHeader() {
    log('startToggleYoutubePageHeader() 00 options?.isHideHeaderForYoutube', options?.isHideHeaderForYoutube);
    if (!options?.isHideHeaderForYoutube) {
      log('startToggleYoutubePageHeader() 00 return', options?.isHideHeaderForYoutube);
      return
    }

    log('startToggleYoutubePageHeader() 11', options);
    if (options.isStartedToggleYoutubePageHeader) {
      return
    }
    options.isStartedToggleYoutubePageHeader = true

    log('startToggleYoutubePageHeader() 22', options);
    const isYoutubePage = document.location.hostname.endsWith('youtube.com')
    const lastPathPart = document.location.pathname.split('/').at(-1)
    const isChannel = isYoutubePage && ['videos','shorts','streams'].includes(lastPathPart)

    if (!isChannel) {
      return
    }

    log('startToggleYoutubePageHeader() 33', options);
    toggleYoutubePageHeader({ nTry: 30 })
  }

  async function addBookmarkByFolderNameList(inParentTitleList) {
    const parentTitleList = inParentTitleList
      .map((s) => s.trim())
      .filter(Boolean)

    if (parentTitleList.length == 0) {
      return
    }

    const fullState = stateContainer.getState()
    const bookmarkList = fullState.bookmarkList || []
    const newBookmarkList = bookmarkList.concat(
      parentTitleList.map((parentTitle) => ({
        id: '',
        title: document.title,
        parentTitle,
        path: '',
        parentId: '',
        optimisticAdd: true,
      })
    ))
    stateContainer.update({ bookmarkList: newBookmarkList })

    await browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME,
      url: document.location.href,
      title: document.title,
      parentTitleList,
    });
  }

  async function returnAuthor({ url, authorUrl }) {
    await browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.RESULT_AUTHOR,
      url,
      authorUrl,
    });
  }

  function getAuthor({ authorSelector, nTry, msDelay }) {
    let authorUrl
    try {
      const el = document.querySelector(authorSelector)
      if (el?.href) {
        authorUrl = el.href
      }
      // eslint-disable-next-line no-unused-vars
    } catch (selectorSyntaxErr)
    // eslint-disable-next-line no-empty
    { }

    const restNTry = nTry - 1

    if (authorUrl) {
      returnAuthor({
        url: document.location.href,
        authorUrl,
      })
    } else {
      if (restNTry > 0) {
        setTimeout(
          () => {
            getAuthor({ authorSelector, nTry: restNTry, msDelay })
          },
          msDelay,
        )
      }
    }
  }

  browser.runtime.onMessage.addListener((message) => {
    log('browser.runtime.onMessage: ', message);
    switch (message.command) {
      // case CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO:
      // case CONTENT_SCRIPT_MSG_ID.TAGS_INFO:
      case CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO: {
        const fullState = stateContainer.getState()
        const bookmarkListBefore = (fullState.bookmarkList || []).filter(({ optimisticAdd }) => !optimisticAdd)
        const partialBookmarkListBefore = fullState.partialBookmarkList || []
        const authorBookmarkListBefore = fullState.authorBookmarkList || []

        let optimisticDelFromTagList = fullState.optimisticDelFromTagList
        let optimisticAddFromTagList = fullState.optimisticAddFromTagList
        let optimisticToStorageDel = fullState.optimisticToStorageDel
        let optimisticToStorageAdd = fullState.optimisticToStorageAdd

        const bookmarkList = message.bookmarkList || bookmarkListBefore
        const partialBookmarkList = message.partialBookmarkList || partialBookmarkListBefore
        const authorBookmarkList = message.authorBookmarkList || authorBookmarkListBefore
        const diff = (bookmarkList.length + partialBookmarkList.length + authorBookmarkList.length)
          - bookmarkListBefore.length
          - partialBookmarkListBefore.length
          - authorBookmarkListBefore.length

        if (diff > 0) {
          if (diff > optimisticAddFromTagList - optimisticToStorageAdd) {
            optimisticDelFromTagList = 0
            optimisticAddFromTagList = 0
            optimisticToStorageDel = 0
            optimisticToStorageAdd = 0
          } else {
            if (optimisticAddFromTagList - optimisticToStorageAdd > 0) {
              const part = Math.min(diff, optimisticAddFromTagList - optimisticToStorageAdd);
              optimisticToStorageAdd += part
            }
          }
        }
        if (diff < 0) {
          if (-diff > optimisticDelFromTagList - optimisticToStorageDel) {
            optimisticDelFromTagList = 0
            optimisticAddFromTagList = 0
            optimisticToStorageDel = 0
            optimisticToStorageAdd = 0
          } else {
            if (optimisticDelFromTagList - optimisticToStorageDel > 0) {
              const part = Math.min(-diff, optimisticDelFromTagList - optimisticToStorageDel);
              optimisticToStorageDel += part
            }
          }
        }

        stateContainer.update({
          ...message,
          optimisticDelFromTagList,
          optimisticAddFromTagList,
          optimisticToStorageDel,
          optimisticToStorageAdd,
        })

        options.isHideHeaderForYoutube = message.isHideHeaderForYoutube || false
        startHideYoutubePageHeader()
        // localStorage.setItem("BkmkInfoGlobalOptions-isHideHeaderForYoutube", options.isHideHeaderForYoutube);
        if (document.location.hostname.endsWith('youtube.com')) {
          document.cookie = `isHideHeaderForYoutube=${options.isHideHeaderForYoutube} ;path=/`;
        }
        // log('document.cookie ', document.cookie)
        break
      }
      case CONTENT_SCRIPT_MSG_ID.CHANGE_URL: {
        log('content-script: CHANGE_URL', message.url);
        const newUrl = message.url
        let isCompatibleUrl

        try {
          const oNewUrl = new URL(newUrl)
          isCompatibleUrl = oNewUrl.origin == document.location.origin && oNewUrl.pathname == document.location.pathname
        } catch (ignoreUrlErr) {
          log('content-script: CHANGE_URL url-error', ignoreUrlErr);
        }

        if (isCompatibleUrl) {
          log('content-script 22');
          //document.location.href = newUrl
          //window.history.pushState(newUrl)
          window.history.replaceState(null, "", newUrl);
        }

        break
      }
      case CONTENT_SCRIPT_MSG_ID.REPLACE_URL: {
        log('content-script: REPLACE_URL ', message.url);
        document.location.href = message.url

        break
      }
      case CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER: {
        cToggleYoutubePageHeader += 1
        toggleYoutubePageHeaderInDom()
        break
      }
      case CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT: {
        const userInput = window.prompt("Enter folder for your bookmark")
        // addBookmarkListByNameWithComma(userInput)
        if (!userInput) {
          break
        }

        const folderNameList = userInput
          .split('---')
          .map((s) => s.trim())
          .filter(Boolean)

        addBookmarkByFolderNameList(folderNameList)
        break
      }
      case CONTENT_SCRIPT_MSG_ID.GET_SELECTION: {
        const selection = document.getSelection().toString()
        addBookmarkByFolderNameList([selection])
        break
      }
      case CONTENT_SCRIPT_MSG_ID.SEND_ME_AUTHOR: {
        const authorSelector = message.authorSelector

        if (authorSelector) {
          getAuthor({ authorSelector, nTry: 4, msDelay: 150 })
        }

        break
      }
    }
  });


  async function sendTabIsReady() {
    try {
      log('before send contentScriptReady');
      await browser.runtime.sendMessage({
        command: EXTENSION_MSG_ID.TAB_IS_READY,
        url: document.location.href,
      });
      log('after send contentScriptReady');
    } catch (er) {
      log('IGNORE send contentScriptReady', er);
    }
  }
  let isMsgReadyWasSend = false

  async function sendTabIsReadyOnce() {
    if (isMsgReadyWasSend) {
      return
    }
    isMsgReadyWasSend = true

    sendTabIsReady()
  }

  document.addEventListener("fullscreenchange", () => {
    let rootDiv = document.getElementById(bkmInfoRootId);

    if (rootDiv) {
      if (document.fullscreenElement) {
        rootDiv.style = 'display:none;';
      } else {
        rootDiv.style = 'display:block;';
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    const fullState = stateContainer.getState()
    const tagListOpenMode = fullState.tagListOpenMode

    if (document.hidden) {
      const update = {
        optimisticDelFromTagList: 0,
        optimisticAddFromTagList: 0,
        optimisticToStorageDel: 0,
        optimisticToStorageAdd: 0,
      }

      if (tagListOpenMode && tagListOpenMode != TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL
        && fullState.isTagListOpenLocal) {
        Object.assign(update, { isTagListOpenLocal: false })
      }
      stateContainer.updateNoRender(update)
    } else {
      sendTabIsReadyOnce()
    }
  });
  window.addEventListener('pageshow', () => {
    log('event window.pageshow');
    startHideYoutubePageHeader()
  });

  if (!document.hidden) {
    sendTabIsReadyOnce()
  }
})();