import {
  rootFolders,
} from './root-folders.js';
import {
  trimTitle,
  trimLow,
  trimLowSingular,
  normalizeTitle,
} from './folder-title.js';
import {
  getTitleDetails,
} from './folder-directives.js';
import {
  makeLogFunction,
} from '../api-low/index.js';

const logFF = makeLogFunction({ module: 'find-folder.js' })

async function findFolderWithExactTitle(title) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url)

  return foundItem
}

export async function findSubFolderWithExactTitle({ title, parentId }) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == parentId)

  return foundItem
}

function makeIsTitleMatch({ title, normalizeFn = (str) => str }) {
  const onlyTitlePattern = getTitleDetails(title).onlyTitle
  const normalizedPattern = normalizeFn(onlyTitlePattern)
  // logFF('makeIsTitleMatch 00', title, onlyTitlePattern, normalizedPattern)

  return function isTitleMatch(testTitle) {
    const onlyTitleTestTitle = getTitleDetails(testTitle).onlyTitle
    const normalizedTestTitle = normalizeFn(onlyTitleTestTitle)

    if (normalizedTestTitle === normalizedPattern) {
      // logFF('isTitleMatch 00', testTitle, onlyTitleTestTitle, normalizedTestTitle)
      return true
    }

    return false
  }
}

async function findByTitle({ title, normalizeFn }) {
  let foundItem
  const bookmarkList = await chrome.bookmarks.search(title);
  // logFF('findByTitle 00', title)
  // logFF('findByTitle 00', bookmarkList)
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn })

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && isTitleMatch(checkItem.title)) {
      foundItem = checkItem
      // logFF('findByTitle 22', checkItem.title)
    }
    i += 1
  }

  return foundItem
}

// example1: node.js -> NodeJS
async function findTitleEndsWithJS(title) {
  const lowTitle = trimLow(title)
  if (!lowTitle.endsWith('.js')) {
    return
  }

  const noDotTitle = `${lowTitle.slice(0, -3)}js`
  const foundItem = await findByTitle({ title: noDotTitle, normalizeFn: trimLow })

  return foundItem
}

// example1: e-commerce -> ecommerce
// example2: micro-frontend -> microfrontend
async function findTitleRemoveDash(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  const noDashTitle = title.replaceAll('-', '')
  const foundItem = await findByTitle({ title: noDashTitle, normalizeFn: trimLowSingular })

  return foundItem
}

// example1: micro-frontend -> micro frontend
async function findTitleReplaceDashToSpace(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  const dashToSpaceTitle = title.replaceAll('-', ' ')
  const foundItem = await findByTitle({ title: dashToSpaceTitle, normalizeFn: trimLowSingular })

  return foundItem
}

// example1: AI Video -> ai-video
async function findTitleReplaceSpaceToDash(title) {
  const trimmedTitle = trimTitle(title)
  if (trimmedTitle.indexOf(' ') == -1) {
    return
  }

  const spaceToDashTitle = title.replaceAll(' ', '-')
  const foundItem = await findByTitle({ title: spaceToDashTitle, normalizeFn: trimLowSingular })

  return foundItem
}

async function findTitleNormalized(title) {
  const foundItem = await findByTitle({ title, normalizeFn: normalizeTitle })

  return foundItem
}

async function findTitleDropEnding(title) {
  const lowTitle = trimLow(title)
  const lastWord = lowTitle.split(' ').at(-1)

  if (!(5 < lastWord.length)) {
    return
  }

  let foundItem
  const dropEndTitle = lowTitle.slice(0, -3)
  const bookmarkList = await chrome.bookmarks.search(dropEndTitle);
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn: normalizeTitle })

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && isTitleMatch(checkItem.title)) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

function findFolderFrom({ isTitleMatch, startFolder }) {
  function traverseSubFolder(folderNode) {
    if (isTitleMatch(folderNode.title)) {
      return folderNode
    }

    const folderList = folderNode.children
      .filter(({ url }) => !url)

    let foundItem
    let i = 0
    while (!foundItem && i < folderList.length) {
      foundItem = traverseSubFolder(folderList[i])
      i += 1
    }
  }

  return traverseSubFolder(startFolder)
}

async function findFolderInSubtree({ title, parentId }) {
  const normalizedTitle = normalizeTitle(title)
  logFF('findFolderInSubtree 00 normalizedTitle', normalizedTitle, parentId)
  // search in direct children
  const isTitleMatch = makeIsTitleMatch({ title, normalizeFn: normalizeTitle })

  const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
  let foundItem = firstLevelNodeList.find((node) => !node.url && isTitleMatch(node.title))
  logFF('findFolderInSubtree 11 firstLevelNodeList', foundItem)

  if (!foundItem) {
    // search in subfolders of direct children
    const [otherBookmarks] = await chrome.bookmarks.getSubTree(parentId)
    const batchList = []

    for (const firstLevelNode of otherBookmarks.children) {
      if (!firstLevelNode.url) {
        const secondLevelFolderList = firstLevelNode.children.filter(({ url }) => !url)
        batchList.push(secondLevelFolderList)
      }
    }

    const allSecondLevelFolderList = batchList.flat()

    let i = 0
    while (!foundItem && i < allSecondLevelFolderList.length) {
      foundItem = findFolderFrom({ isTitleMatch, startFolder: allSecondLevelFolderList[i] })
      i += 1
    }
    logFF('findFolderInSubtree 22 secondLevelFolderList', foundItem)
  }

  return foundItem
}

export async function findFolder(title) {
  logFF('findFolder 00 title', title)
  let foundItem

  if (!foundItem) {
    foundItem = await findTitleNormalized(title)
    logFF('findTitleNormalized -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderWithExactTitle(title)
    logFF('findFolderWithExactTitle -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleEndsWithJS(title)
    logFF('findTitleEndsWithJS -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleRemoveDash(title)
    logFF('findTitleRemoveDash -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleReplaceDashToSpace(title)
    logFF('findTitleReplaceDashToSpace -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleReplaceSpaceToDash(title)
    logFF('findTitleReplaceSpaceToDash -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleDropEnding(title)
    logFF('findTitleDropEnding -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })
    logFF('findFolderInSubtree OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })
    logFF('findFolderInSubtree BOOKMARKS_BAR_FOLDER_ID', foundItem)
  }

  return foundItem
}
