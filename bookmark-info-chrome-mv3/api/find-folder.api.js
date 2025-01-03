import {
  BOOKMARKS_BAR_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.api.js';
import {
  isStartWithTODO,
  normalizeTitle,
  trimLow,
  trimLowSingular,
} from './text.api.js';
import {
  makeLogFunction,
} from './log.api.js'
import {
  createFolderIgnoreInController,
  updateBookmarkIgnoreInController,
} from './bookmark.api.js'

const logFF = makeLogFunction({ module: 'find-folder.api.js' })

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
  logFF('findFolder 00 title', title)
  let foundItem

  const bookmarkList = await chrome.bookmarks.search({ title });
  logFF('findFolder 11 search({ title })', bookmarkList.length, bookmarkList)
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
    const noDotTitle = `${lowTitle.slice(0, -3)}js`

    const bookmarkList = await chrome.bookmarks.search(noDotTitle);
    logFF('findFolder 22 search(title) noDotTitle', noDotTitle)
    logFF('findFolder 22 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLow(checkItem.title) === noDotTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  if (!foundItem) {
    const noDashTitle = trimLowSingular(title.replaceAll('-', ''))
    logFF('findFolder 333 noDashTitle', noDashTitle)

    const bookmarkList = await chrome.bookmarks.search(noDashTitle);
    logFF('findFolder 333 search(noDashTitle)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLowSingular(checkItem.title) === noDashTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  if (!foundItem) {
    const dashToSpaceTitle = trimLowSingular(title.replaceAll('-', ' '))
    logFF('findFolder 333 dashToSpaceTitle', dashToSpaceTitle)

    const bookmarkList = await chrome.bookmarks.search(dashToSpaceTitle);
    logFF('findFolder 333 search(dashToSpaceTitle)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLowSingular(checkItem.title) === dashToSpaceTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  const normalizedTitle = normalizeTitle(title)
  logFF('findFolder 00 normalizedTitle', normalizedTitle)

  if (!foundItem) {
    logFF('findFolder 33 normalizedTitle', normalizedTitle)

    const bookmarkList = await chrome.bookmarks.search(title);
    logFF('findFolder 33 search(title)', bookmarkList.length, bookmarkList)

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
    logFF('findFolder 44 search(title) modifiedTitle', modifiedTitle)
    logFF('findFolder 44 search(title)', bookmarkList.length, bookmarkList)

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
    logFF('findFolder 55 OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ normalizedTitle, parentId: BOOKMARKS_BAR_FOLDER_ID })
    logFF('findFolder 66 BOOKMARKS_BAR_FOLDER_ID', foundItem)
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
    logFF('findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    folder = await createFolderIgnoreInController(folderParams)
  } else {
    const oldBigLetterN = folder.title.replace(/[^A-Z]+/g, "").length
    const newBigLetterN = title.replace(/[^A-Z]+/g, "").length
    // const isAbbreviation = title.length == newBigLetterN

    if (oldBigLetterN < newBigLetterN) {
      await updateBookmarkIgnoreInController({ id: folder.id, title })
    }
  }

  return folder
}
