let log = () => {};
// log = console.log

(async function() {
  log('IN content-script 00');

  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  // TODO-DOUBLE remove duplication in EXTENSION_MSG_ID: message-id.js and content-scripts.js
  const EXTENSION_MSG_ID = {
    DELETE_BOOKMARK: 'DELETE_BOOKMARK',
    ADD_BOOKMARK: 'ADD_BOOKMARK',
    ADD_BOOKMARK_FOLDER_BY_NAME: 'ADD_BOOKMARK_FOLDER_BY_NAME',
    FIX_TAG: 'FIX_TAG',
    UNFIX_TAG: 'UNFIX_TAG',
    TAB_IS_READY: 'TAB_IS_READY',
    SHOW_TAG_LIST: 'SHOW_TAG_LIST',
    ADD_RECENT_TAG: 'ADD_RECENT_TAG',
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
  }

  // TODO-DOUBLE remove duplication BROWSER in browser-specific.js and content-scripts.js
  const BROWSER_OPTIONS = {
    CHROME: 'CHROME',
    FIREFOX: 'FIREFOX',
  }
  const BROWSER_SPECIFIC_OPTIONS = {
    DEL_BTN_RIGHT_PADDING: {
      [BROWSER_OPTIONS.CHROME]: '0.5ch',
      [BROWSER_OPTIONS.FIREFOX]: '1ch'
    },
    LABEL_RIGHT_PADDING: {
      [BROWSER_OPTIONS.CHROME]: '0.3ch',
      [BROWSER_OPTIONS.FIREFOX]: '0.6ch'
    }
  }
  const BROWSER = BROWSER_OPTIONS.CHROME;
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
  const bkmInfoStyle1Id = 'bkm-info--style1';
  const bkmInfoStyle2Id = 'bkm-info--style2';

  function getChangeableStyleText({ fontSize, tagLength, isHideSemanticHtmlTagsOnPrinting }) {
    let semanticTagsStyle = ''

    if (isHideSemanticHtmlTagsOnPrinting) {
      semanticTagsStyle = (
`@media print {
  header, footer, aside, nav {
      display: none;
  }
  .blockSpoiler, .blockSpoiler-content {
    display: none;
  }
}`
      )
    }

    const fontSizeLetter = Math.floor(10/14*(+fontSize))

    return (
`#${bkmInfoRootId} {
  font-size: ${fontSize}px;
  width: ${tagLength}ch;
}
.bkm-info--tag {
  min-width: ${tagLength}ch;
  max-width: ${tagLength}ch;
}
.bkm-info--btn-letter {
  font-size: ${fontSizeLetter}px;
}
${semanticTagsStyle}
`
    )
  }

  function getConstantStyleText() {
    return (
`
#${bkmInfoRootId} {
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
@media print {
  #${bkmInfoRootId} {
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
  padding-right: ${BROWSER_SPECIFIC.LABEL_RIGHT_PADDING};
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
  padding-right: ${BROWSER_SPECIFIC.LABEL_RIGHT_PADDING};
  text-wrap: nowrap;
  line-height: inherit;
  font-family: inherit !important;
  margin: inherit;
}
.bkm-info--fixed {
  background-color: #40E0D0;
}
.bkm-info--fixed:active {
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
  background-color: #32CD32;
}
.bkm-info--btn-unfix:hover {
  display: flex;
  background-color: #00FF00;
}

.bkm-info--recent {
  background-color: #DAF7A6;
}
.bkm-info--recent:active {
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
    )
  };

  async function hideBookmarks() {
    const rootDiv = document.getElementById(bkmInfoRootId);

    if (rootDiv) {
      while (rootDiv.lastChild) {
        rootDiv.removeChild(rootDiv.lastChild);
      }
    }
  }

  async function onBookmarkLabelClick(event) {
    log('onBookmarkLabelClick 00', event?.target);
    const bkmid = event?.target?.dataset?.bkmid

    if (bkmid) {
      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.ADD_RECENT_TAG,
        bookmarkId: bkmid,
      });
    }

    hideBookmarks()
  }

  async function deleteBookmark(event) {
    log('deleteBookmark 00');
    const bkmId = event?.target?.dataset?.bkmid || event?.target?.parentNode?.dataset?.bkmid;

    if (bkmId) {
      // optimistic ui
      const fullState = showInHtmlSingleTaskQueue.getState()
      const bookmarkList = fullState.bookmarkList || []

      const findIndex = bookmarkList.findIndex((item) => item.id == bkmId)
      if (-1 < findIndex) {
        const newBookmarkList = bookmarkList.with(findIndex, { optimisticDel: true })
        showInHtmlSingleTaskQueue.addUpdate({ bookmarkList: newBookmarkList })
      }

      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.DELETE_BOOKMARK,
        bkmId,
      });
    }
  }

  async function toggleTagList() {
    const fullMessage = showInHtmlSingleTaskQueue.getState()
    const tagListOpenMode = fullMessage.tagListOpenMode

    if (tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL) {
      const before = !!fullMessage.isTagListOpenGlobal
      showInHtmlSingleTaskQueue.addUpdate({ isTagListOpenGlobal: !before })
      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.SHOW_TAG_LIST,
        value: !before,
      });
    } else {
      const before = !!fullMessage.isTagListOpenLocal
      showInHtmlSingleTaskQueue.addUpdate({ isTagListOpenLocal: !before })
    }
  }

  async function toggleTag(event) {
    const parentId = event?.target?.dataset?.parentid;
    const isUsed = event?.target?.dataset?.isused;
    // log('toggleTag () 00', 'isUsed', isUsed, 'parentId', parentId)

    if (parentId) {
      const fullState = showInHtmlSingleTaskQueue.getState()
      const bookmarkList = fullState.bookmarkList || []
      const tagListOpenMode = fullState.tagListOpenMode

      if (isUsed) {
        const bkm = bookmarkList.find((item) => item.parentId === parentId)

        if (bkm?.id) {
          // epic error
          // const findIndex = bookmarkList.findIndex((item) => item.id != bkm.id)
          const findIndex = bookmarkList.findIndex((item) => item.id == bkm.id)
          if (-1 < findIndex) {
            const newBookmarkList = bookmarkList.with(findIndex, { optimisticDel: true })
            optimisticDelFromTagList += 1
            // log('bookmarkFromTag 11 +optimisticDelFromTagList', optimisticDelFromTagList);
            showInHtmlSingleTaskQueue.addUpdate({ bookmarkList: newBookmarkList })
          }

          await chrome.runtime.sendMessage({
            command: EXTENSION_MSG_ID.DELETE_BOOKMARK,
            bkmId: bkm.id,
          });
        }
      } else {
        // optimistic ui
        const tagList = fullState.tagList || []
        const tag = tagList.find((item) => item.parentId === parentId)
        if (tag) {
          const newBookmarkList = bookmarkList.concat({
            id: '',
            title: document.title,
            fullPathList: [tag.title],
            parentId,
            optimisticAdd: true,
          })
          if (optimisticAddFromTagList < optimisticDelFromTagList) {
            optimisticAddFromTagList += 1
          }

          const update = { bookmarkList: newBookmarkList }
          if (tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.CLOSE_AFTER_ADD) {
            update.isTagListOpenLocal = false

            optimisticDelFromTagList = 0
            optimisticAddFromTagList = 0
            optimisticToStorageDel = 0
            optimisticToStorageAdd = 0
          }
          showInHtmlSingleTaskQueue.addUpdate(update)
        }
        await chrome.runtime.sendMessage({
          command: EXTENSION_MSG_ID.ADD_BOOKMARK,
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
      const fullState = showInHtmlSingleTaskQueue.getState()
      const tagList = fullState.tagList || []

      let tag
      const findIndex = tagList.findIndex((item) => item.parentId == parentId)
      if (-1 < findIndex) {
        tag = tagList[findIndex]
        const newTagList = tagList.with(findIndex, { ...tag, isFixed: true })
        showInHtmlSingleTaskQueue.addUpdate({ tagList: newTagList })
      }

      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.FIX_TAG,
        parentId,
        title: tag?.title,
      });
    }
  }

  async function unfixTag(event) {
    log('unfixTag 00');
    const parentId = event?.target?.dataset?.parentid || event?.target?.parentNode?.dataset?.parentid;

    if (parentId) {
      const fullState = showInHtmlSingleTaskQueue.getState()
      const tagList = fullState.tagList || []

      let tag
      const findIndex = tagList.findIndex((item) => item.parentId == parentId)
      if (-1 < findIndex) {
        tag = tagList[findIndex]
        const newTagList = tagList.with(findIndex, { ...tag, isFixed: false })
        showInHtmlSingleTaskQueue.addUpdate({ tagList: newTagList })
      }

      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.UNFIX_TAG,
        parentId,
      });
    }
  }


  let storedFontSize
  let storedTagLength;
  let storedIsHideSemanticHtmlTagsOnPrinting;

  function showBookmarkInfo(input) {
    const bookmarkList = (input.bookmarkList || [])
      .filter(({ optimisticDel }) => !optimisticDel)
      .filter(({ source }) => source !== 'substring')

    const partialBookmarkList = (input.bookmarkList || [])
      .filter(({ source }) => source == 'substring')

    const visitString = input.visitString || []
    const isShowTitle = input.isShowTitle || false
    const inTagList = input.tagList || []
    const tagListOpenMode = input.tagListOpenMode
    const isTagListOpenLocal = input.isTagListOpenLocal || false
    const isTagListOpenGlobal = input.isTagListOpenGlobal || false
    const isTagListOpen = tagListOpenMode == TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL
      ? isTagListOpenGlobal
      : isTagListOpenLocal
    const fontSize = input.fontSize || 14
    const tagLength = input.tagLength || 15
    const isHideSemanticHtmlTagsOnPrinting = input.isHideSemanticHtmlTagsOnPrinting || false

    log('showBookmarkInfo 00');

    const usedParentIdSet = new Set(bookmarkList.map(({ parentId }) => parentId))
    const tagList = inTagList.map(({ parentId, title, isFixed, isLast}) => ({
      parentId,
      title,
      isFixed,
      isLast,
      isUsed: usedParentIdSet.has(parentId)
    }))

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
      // const { title } = value

      // if (isShowTitle && title) {
      //   if (title !== prevTitle) {
      //     drawList.push({ type: 'title', value: title })
      //     prevTitle = title
      //   }
      // }

      drawList.push({ type: 'partial-bookmark', value, bkmIndex: index + bookmarkList.length })
    })

    if (tagList.length > 0) {
    //if (tagList.length > 0 && isTagListOpen) {
      const emptySlotsForDel = Math.max(0, optimisticDelFromTagList - optimisticAddFromTagList)
      const emptySlotsForAdd = Math.max(0, 2 - bookmarkList.length - partialBookmarkList.length - emptySlotsForDel)
      const emptySlots = emptySlotsForAdd + emptySlotsForDel

      for (let iEmpty = 0; iEmpty < emptySlots; iEmpty += 1) {
        drawList.push({ type: 'emptySlot' })
      }
    }

    if (visitString) {
      drawList.push({ type: 'history', value: visitString })
    }

    if (tagList.length > 0) {
      drawList.push({ type: 'separator' })

      if (isTagListOpen) {
        tagList.forEach(({ isFixed, isLast, parentId, title, isUsed }) => {
          drawList.push({
            type: isFixed ? 'fixedTag' : 'recentTag',
            value: { parentId, title, isUsed, isLast },
          })
        })
      }
    }

    let rootStyle1 = document.getElementById(bkmInfoStyle1Id);
    let rootDiv = document.getElementById(bkmInfoRootId);
    if (!rootStyle1) {
      storedFontSize = fontSize
      storedTagLength = tagLength
      storedIsHideSemanticHtmlTagsOnPrinting = isHideSemanticHtmlTagsOnPrinting

      rootStyle1 = document.createElement('style');
      rootStyle1.setAttribute('id', bkmInfoStyle1Id);
      const textNodeStyle1 = document.createTextNode(
        getChangeableStyleText({ fontSize, tagLength, isHideSemanticHtmlTagsOnPrinting })
      );
      rootStyle1.appendChild(textNodeStyle1);

      const rootStyle2 = document.createElement('style');
      rootStyle2.setAttribute('id', bkmInfoStyle2Id);
      const textNodeStyle2 = document.createTextNode(
        getConstantStyleText()
      );
      rootStyle2.appendChild(textNodeStyle2);

      document.body.insertAdjacentElement('afterbegin', rootStyle1);
      rootStyle1.insertAdjacentElement('afterend', rootStyle2);

      rootDiv = document.createElement('div');
      rootDiv.setAttribute('id', bkmInfoRootId);
      rootStyle2.insertAdjacentElement('afterend', rootDiv);
    }

    if (!(fontSize == storedFontSize && tagLength == storedTagLength
      && isHideSemanticHtmlTagsOnPrinting == storedIsHideSemanticHtmlTagsOnPrinting)) {
      storedFontSize = fontSize
      storedTagLength = tagLength
      storedIsHideSemanticHtmlTagsOnPrinting = isHideSemanticHtmlTagsOnPrinting

      // const textNodeStyle1 = document.createTextNode(
      //   getChangeableStyleText({ fontSize, tagLength, isHideSemanticHtmlTagsOnPrinting })
      // );
      // rootStyle1.replaceChild(textNodeStyle1, rootStyle1.firstChild);
      rootStyle1.firstChild.replaceWith(
        getChangeableStyleText({ fontSize, tagLength, isHideSemanticHtmlTagsOnPrinting })
      )
    }

    const rawNodeList = rootDiv.childNodes;
    const beforeRawLength = rawNodeList.length;

    drawList.forEach(({ type, value, bkmIndex }, index) => {
      let divRow

      switch (type) {
        case 'bookmark': {
          const { id, fullPathList } = value
          const [folderName] = fullPathList.slice(-1)
          const restPathList = fullPathList.slice(0, -1)
          const restPath = restPathList.concat('').join('/ ')

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', bkmIndex % 2 == 0 ? 'bkm-info--bkm-1' : 'bkm-info--bkm-2');
          const textNode = document.createTextNode(folderName);
          divLabel.appendChild(textNode);
          divLabel.setAttribute('data-restpath', restPath);

          divLabel.addEventListener('click', onBookmarkLabelClick);
          // TODO sanitize: remove ",<,>
          // const sanitizedFullPath = fullPath
          //   .replaceAll('"', '&quot;')
          //   .replaceAll('>', '&gt;')
          //   .replaceAll('<', '&lt;')
          // divLabel.setAttribute('data-restpath', sanitizedFullPath);
          //
          // Symbols ( " > < ) don't break html and displayed as text.
          divLabel.setAttribute('data-bkmid', id);

          const divDelBtn = document.createElement('div');
          divDelBtn.setAttribute('data-bkmid', id);
          divDelBtn.classList.add('bkm-info--btn', 'bkm-info--btn-del');

          const divDelBtnLetter = document.createElement('div');
          divDelBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeDel = document.createTextNode('X');
          divDelBtnLetter.appendChild(textNodeDel);

          divDelBtn.appendChild(divDelBtnLetter);
          divDelBtn.addEventListener('click', deleteBookmark);

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
          const { id, fullPathList, url } = value
          const [folderName] = fullPathList.slice(-1)

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--bkm', bkmIndex % 2 == 0 ? 'bkm-info--bkm-1' : 'bkm-info--bkm-2');

          const textNode = document.createTextNode(`url*: ${folderName}`);
          divLabel.appendChild(textNode);
          divLabel.setAttribute('data-restpath', `url*: ${url}`);

          divLabel.addEventListener('click', onBookmarkLabelClick);
          divLabel.setAttribute('data-bkmid', id);

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
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.addEventListener('click', hideBookmarks);
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'history': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--history');
          divLabel.addEventListener('click', hideBookmarks);
          const textNode = document.createTextNode(`${value}`);
          divLabel.appendChild(textNode);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.addEventListener('click', hideBookmarks);
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'separator': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--label', 'bkm-info--separator');
          divLabel.addEventListener('click', toggleTagList);
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
        case 'recentTag': {
          const { parentId, title, isUsed, isLast } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--tag', 'bkm-info--recent');
          divLabel.setAttribute('data-parentid', parentId);
          divLabel.addEventListener('click', toggleTag);

          divLabel.classList.toggle('bkm-info--used-tag', isUsed);
          divLabel.setAttribute('data-isused', isUsed ? '1' : '');
          divLabel.classList.toggle('bkm-info--last-tag', isLast);

          const textNodeLabel = document.createTextNode(`${title}`);
          divLabel.appendChild(textNodeLabel);

          const divFixBtn = document.createElement('div');
          divFixBtn.setAttribute('data-parentid', parentId);
          divFixBtn.classList.add('bkm-info--btn', 'bkm-info--btn-fix');
          divFixBtn.addEventListener('click', fixTag);

          const divFixBtnLetter = document.createElement('div');
          divFixBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeFix = document.createTextNode('⊙');
          divFixBtnLetter.appendChild(textNodeFix);
          divFixBtn.appendChild(divFixBtnLetter);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divFixBtn);
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'fixedTag': {
          const { parentId, title, isUsed, isLast } = value

          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--tag', 'bkm-info--fixed');
          divLabel.setAttribute('data-parentid', parentId);
          divLabel.addEventListener('click', toggleTag);

          divLabel.classList.toggle('bkm-info--used-tag', isUsed);
          divLabel.setAttribute('data-isused', isUsed ? '1' : '');
          divLabel.classList.toggle('bkm-info--last-tag', isLast);

          const textNodeLabel = document.createTextNode(`${title}`);
          divLabel.appendChild(textNodeLabel);

          const divFixBtn = document.createElement('div');
          divFixBtn.setAttribute('data-parentid', parentId);
          divFixBtn.classList.add('bkm-info--btn', 'bkm-info--btn-unfix');
          divFixBtn.addEventListener('click', unfixTag);

          const divFixBtnLetter = document.createElement('div');
          divFixBtnLetter.classList.add('bkm-info--btn-letter');
          const textNodeFix = document.createTextNode('X');
          divFixBtnLetter.appendChild(textNodeFix);

          divFixBtn.appendChild(divFixBtnLetter);

          const divLabelContainer = document.createElement('div');
          divLabelContainer.classList.add('bkm-info--label-container');
          divLabelContainer.appendChild(divFixBtn);
          divLabelContainer.appendChild(divLabel);

          divRow = document.createElement('div');
          divRow.classList.add('bkm-info--row');
          divRow.appendChild(divLabelContainer);

          break
        }
        case 'title': {
          const divLabel = document.createElement('div');
          divLabel.classList.add('bkm-info--title');
          divLabel.addEventListener('click', hideBookmarks);
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
  }

  class TaskQueue {
    fullState = {}
    updateList = []
    fnTask

    promise = Promise.resolve(0)
    fnResolve
    fnReject

    constructor(fnTask) {
      this.fnTask = fnTask
    }
    async continueQueue() {
      // console.log('continueQueue 00')
      await this.promise.catch()

      // console.log('continueQueue 11')
      this.promise = new Promise((fnResolve, fnReject) => {
        this.fnResolve = fnResolve;
        this.fnReject = fnReject;
      });

      let sumUpdate = {}
      let step = this.updateList.shift()
      while (step) {
        sumUpdate = { ...sumUpdate, ...step }
        step = this.updateList.shift()
      }
      // console.log('continueQueue 66 sumUpdate', sumUpdate)
      if (Object.keys(sumUpdate).length > 0) {
        this.fullState = { ...this.fullState, ...sumUpdate }
        // console.log('continueQueue 77 ')
        this.fnTask(this.fullState)
      }

      // console.log('continueQueue 88')
      this.fnResolve()
      // console.log('continueQueue 99')
    }
    addUpdate(update) {
      this.updateList.push(update)

      this.continueQueue()
    }
    getState() {
      return { ...this.fullState }
    }
  }

  const showInHtmlSingleTaskQueue = new TaskQueue(showBookmarkInfo)


  const options = {}
  let cToggleYoutubePageHeader = 0
  let ytHeaderPadding
  // eslint-disable-next-line no-unused-vars
  let ytTimerId

  function toggleYoutubePageHeaderInDom() {
    const ytDiv = document.querySelector('#page-header-container');
    log('isHideHeaderForYoutube 00 ytDiv', ytDiv?.id, ytDiv);

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
    const isHideHeaderForYoutube = options.isHideHeaderForYoutube || false

    if (isHideHeaderForYoutube) {
      const isYoutubePage = document.location.hostname.endsWith('youtube.com')
      const isChannel = isYoutubePage && (
        document.location.pathname.startsWith('/@')
        || document.location.pathname.startsWith('/c/')
        || document.location.pathname.startsWith('/channel/')
      )

      if (isChannel) {
        const ytDiv = document.querySelector('#page-header-container');
        const restNTry = nTry - 1

        if (ytDiv) {
          toggleYoutubePageHeaderInDom()
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
    }
  }

  async function addBookmarkByFolderName(folderName) {
    if (!folderName) {
      return
    }
    const trimmedFolderName = folderName.trim()
    if (!trimmedFolderName) {
      return
    }

    const fullState = showInHtmlSingleTaskQueue.getState()
    const bookmarkList = fullState.bookmarkList || []
    const newBookmarkList = bookmarkList.concat({
      id: '',
      title: document.title,
      fullPathList: [trimmedFolderName],
      parentId: '',
      optimisticAdd: true,
    })
    showInHtmlSingleTaskQueue.addUpdate({ bookmarkList: newBookmarkList })

    await chrome.runtime.sendMessage({
      command: EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME,
      url: document.location.href,
      title: document.title,
      folderName: trimmedFolderName,
    });
  }

  async function addBookmarkListByNameWithComma(strList) {
    if (!strList) {
      return
    }

    const list = strList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (list.length == 0) {
      return
    }

    const uniqueList = []
    const nameSet = new Set()
    list.forEach((name) => {
      const normalizedName = name.toLowerCase().replace(/\s+/, ' ')

      if (!nameSet.has(normalizedName)) {
        nameSet.add(normalizedName)
        uniqueList.push(name)
      }
    })

    await uniqueList.reduce(
      (promiseChain, name) => promiseChain.then(
        () => addBookmarkByFolderName(name)
      ),
      Promise.resolve(),
    );
  }

  chrome.runtime.onMessage.addListener((message) => {
    log('chrome.runtime.onMessage: ', message);
    switch (message.command) {
      // case CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO:
      // case CONTENT_SCRIPT_MSG_ID.TAGS_INFO:
      case CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO: {
        const fullState = showInHtmlSingleTaskQueue.getState()
        const bookmarkListBefore = (fullState.bookmarkList || []).filter(({ optimisticAdd }) => !optimisticAdd)

        showInHtmlSingleTaskQueue.addUpdate(message)
        const bookmarkList = message.bookmarkList || []
        const diff = bookmarkList.length - bookmarkListBefore.length

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

        options.isHideHeaderForYoutube = message.isHideHeaderForYoutube || false
        toggleYoutubePageHeader({ nTry: 30 })
        break
      }
      case CONTENT_SCRIPT_MSG_ID.CHANGE_URL: {
        log('content-script: CHANGE_URL', message.url);
        const newUrl = message.url

        if (document.location.href.startsWith(newUrl)) {
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
        toggleYoutubePageHeader({ nTry: 1 })
        break
      }
      case CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT: {
        const userInput = window.prompt("Enter folder for your bookmark")
        addBookmarkListByNameWithComma(userInput)
        break
      }
      case CONTENT_SCRIPT_MSG_ID.GET_SELECTION: {
        const selection = document.getSelection().toString()
        addBookmarkByFolderName(selection)
        break
      }
    }
  });

  let isMsgReadyWasSend = false

  async function sendTabIsReady() {
    if (isMsgReadyWasSend) {
      return
    }
    isMsgReadyWasSend = true

    try {
      log('before send contentScriptReady');
      await chrome.runtime.sendMessage({
        command: EXTENSION_MSG_ID.TAB_IS_READY,
        url: document.location.href,
      });
      log('after send contentScriptReady');
    } catch (er) {
      log('IGNORE send contentScriptReady', er);
    }
  }

  let optimisticDelFromTagList = 0
  let optimisticAddFromTagList = 0
  let optimisticToStorageDel = 0
  let optimisticToStorageAdd = 0

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
    const fullState = showInHtmlSingleTaskQueue.getState()
    const tagListOpenMode = fullState.tagListOpenMode
    if (document.hidden) {
      if (tagListOpenMode && tagListOpenMode != TAG_LIST_OPEN_MODE_OPTIONS.GLOBAL
        && fullState.isTagListOpenLocal) {

        showInHtmlSingleTaskQueue.addUpdate({ isTagListOpenLocal: false })
      }
    }

    if (!document.hidden) {
      optimisticDelFromTagList = 0
      optimisticAddFromTagList = 0
      optimisticToStorageDel = 0
      optimisticToStorageAdd = 0
      sendTabIsReady()
    }
  });

  if (!document.hidden) {
    sendTabIsReady()
  }
})();
