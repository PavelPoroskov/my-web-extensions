import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.js';
import {
  trimLow,
  trimLowSingular,
  normalizeTitle,
} from './folder-title.js';
import {
  makeLogFunction,
} from '../api-low/index.js';

const logFF = makeLogFunction({ module: 'find-folder.js' })

export async function findFolderWithExactTitle({ title, rootId }) {
  let foundItem

  const nodeList = await chrome.bookmarks.search({ title });

  if (rootId) {
    foundItem = nodeList.find((node) => !node.url && node.parentId == rootId)
  } else {
    foundItem = nodeList.find((node) => !node.url)
  }

  return foundItem
}

// example1: node.js -> NodeJS
async function findTitleEndsWithJS(title) {
  let foundItem
  const lowTitle = trimLow(title)

  if (lowTitle.endsWith('.js')) {
    const noDotTitle = `${lowTitle.slice(0, -3)}js`
    const bookmarkList = await chrome.bookmarks.search(noDotTitle);

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLow(checkItem.title) === noDotTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  return foundItem
}

// example1: e-commerce -> ecommerce
// example2: micro-frontend -> microfrontend
async function findTitleRemoveDash(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  let foundItem
  const noDashTitle = trimLowSingular(title.replaceAll('-', ''))
  const bookmarkList = await chrome.bookmarks.search(noDashTitle);

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && trimLowSingular(checkItem.title) === noDashTitle) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

// example1: micro-frontend -> micro frontend
async function findTitleReplaceDashToSpace(title) {
  if (title.indexOf('-') == -1) {
    return
  }

  let foundItem
  const dashToSpaceTitle = trimLowSingular(title.replaceAll('-', ' '))
  const bookmarkList = await chrome.bookmarks.search(dashToSpaceTitle);

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && trimLowSingular(checkItem.title) === dashToSpaceTitle) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

// example1: AI Video -> ai-video
async function findTitleReplaceSpaceToDash(title) {
  const trimLowSingularTitle = trimLowSingular(title)
  if (trimLowSingularTitle.indexOf(' ') == -1) {
    return
  }

  let foundItem
  const spaceToDashTitle = trimLowSingularTitle.replaceAll(' ', '-')
  const bookmarkList = await chrome.bookmarks.search(spaceToDashTitle);

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && trimLowSingular(checkItem.title) === spaceToDashTitle) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

async function findTitleNormalized(title) {
  let foundItem
  const normalizedTitle = normalizeTitle(title)
  const bookmarkList = await chrome.bookmarks.search(title);

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
      foundItem = checkItem
    }
    i += 1
  }

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
  const normalizedTitle = normalizeTitle(title)
  const bookmarkList = await chrome.bookmarks.search(dropEndTitle);

  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
      foundItem = checkItem
    }
    i += 1
  }

  return foundItem
}

function findFolderFrom({ normalizedTitle, startFolder }) {
  function traverseSubFolder(folderNode) {
    if (normalizeTitle(folderNode.title) === normalizedTitle) {
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
  const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
  let foundItem = firstLevelNodeList.find((node) => !node.url && normalizeTitle(node.title) === normalizedTitle)
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
      foundItem = findFolderFrom({ normalizedTitle, startFolder: allSecondLevelFolderList[i] })
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
    foundItem = await findFolderWithExactTitle({ title })
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
    foundItem = await findTitleNormalized(title)
    logFF('findTitleNormalized -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findTitleDropEnding(title)
    logFF('findTitleDropEnding -> ', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: OTHER_BOOKMARKS_FOLDER_ID })
    logFF('findFolderInSubtree OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ title, parentId: BOOKMARKS_BAR_FOLDER_ID })
    logFF('findFolderInSubtree BOOKMARKS_BAR_FOLDER_ID', foundItem)
  }

  return foundItem
}
