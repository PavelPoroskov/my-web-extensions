import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.api.js';
import {
  isStartWithTODO,
  normalizeTitle,
  trimLow,
} from './text.api.js';
import {
  makeLogFunction,
} from './log.api.js'

const logFA = makeLogFunction({ module: 'folder.api' })

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

async function findFolderInSubtree({ normalizedTitle, parentId }) {
  logFA('findFolderInSubtree 00 normalizedTitle', normalizedTitle, parentId)
  // search in direct children
  const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
  let foundItem = firstLevelNodeList.find((node) => !node.url && normalizeTitle(node.title) === normalizedTitle)
  logFA('findFolderInSubtree 11 firstLevelNodeList', foundItem)

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
    logFA('findFolderInSubtree 22 secondLevelFolderList', foundItem)
  }

  return foundItem
}

// option 1
//  getChildren, filter folders, compare (case insensitive, plural insensitive)
//  find here (case insensitive, plural insensitive) folder
// option 2
//  git.search({ title }) // case sensitive,
//    question: will this return folders?
//    filter folders
//  onStart, merge will be
// option 3
//  git.search(query) // case insensitive,
//    question: will this return folders?
//    filter folders
//  onStart, merge will be
async function findFolder(title) {
  logFA('findFolder 00 title', title)
  const normalizedTitle = normalizeTitle(title)
  logFA('findFolder 00 normalizedTitle', normalizedTitle)
  let foundItem

  const bookmarkList = await chrome.bookmarks.search({ title });
  logFA('findFolder 11 search({ title })', bookmarkList.length, bookmarkList)
  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url) {
      foundItem = checkItem
    }
    i += 1
  }


  const lowTitle = trimLow(title)

  if (!foundItem && lowTitle.endsWith('.js')) {
    const modifiedTitle = `${lowTitle.slice(0, -3)}js`

    const bookmarkList = await chrome.bookmarks.search(modifiedTitle);
    logFA('findFolder 22 search(title) modifiedTitle', modifiedTitle)
    logFA('findFolder 22 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLow(checkItem.title) === modifiedTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  if (!foundItem) {
    logFA('findFolder 33 normalizedTitle', normalizedTitle)

    const bookmarkList = await chrome.bookmarks.search(title);
    logFA('findFolder 33 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  const lowTitle2 = trimLow(title)
  const lastWord = lowTitle2.split(' ').at(-1)

  if (!foundItem && lastWord.length > 5) {
    const modifiedTitle = lowTitle2.slice(0, -3)

    const bookmarkList = await chrome.bookmarks.search(modifiedTitle);
    logFA('findFolder 44 search(title) modifiedTitle', modifiedTitle)
    logFA('findFolder 44 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ normalizedTitle, parentId: OTHER_BOOKMARKS_FOLDER_ID })
    logFA('findFolder 55 OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ normalizedTitle, parentId: BOOKMARKS_BAR_FOLDER_ID })
    logFA('findFolder 66 BOOKMARKS_BAR_FOLDER_ID', foundItem)
  }

  return foundItem
}

export async function findOrCreateFolder(title) {
  let folder = await findFolder(title)

  if (!folder) {
    const parentId = isStartWithTODO(title)
      ? BOOKMARKS_BAR_FOLDER_ID
      : OTHER_BOOKMARKS_FOLDER_ID

    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    logFA('findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    folder = await chrome.bookmarks.create(folderParams)
  }

  return folder
}
