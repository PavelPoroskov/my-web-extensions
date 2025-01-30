import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
  findFolder,
  findFolderWithExactTitle,
  getDatedTitle,
  isDatedFolderTemplate,
  isStartWithTODO,
} from '../folder-api/index.js';
import {
  createFolderIgnoreInController,
} from './folder-ignore.js'

const logFCR = makeLogFunction({ module: 'folder-create.js' })

export async function findOrCreateFolder(title) {
  let folder = await findFolder(title)

  if (!folder) {
    const parentId = isStartWithTODO(title)
      ? BOOKMARKS_BAR_FOLDER_ID
      : OTHER_BOOKMARKS_FOLDER_ID

    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    logFCR('findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

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
    logFCR('findOrCreateFolder () 22', oldBigLetterN, newBigLetterN)

    if (oldBigLetterN < newBigLetterN) {
      // await updateFolderIgnoreInController({ id: folder.id, title })
      await chrome.bookmarks.update(folder.id, { title })
    }
  }

  return folder
}

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
export async function getDatedFolder(templateTitle) {
  if (!isDatedFolderTemplate(templateTitle)) {
    return
  }
  logFCR('getDatedFolder () 00', templateTitle)

  const datedTitle = getDatedTitle(templateTitle)
  logFCR('getDatedFolder () 11', 'datedTitle', datedTitle)
  const rootId = isStartWithTODO(datedTitle)
    ? BOOKMARKS_BAR_FOLDER_ID
    : BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
  let foundFolder = await findFolderWithExactTitle({ title: datedTitle, rootId })

  if (!foundFolder) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(rootId)
    const findIndex = firstLevelNodeList.find((node) => !node.url && datedTitle.localeCompare(node.title) < 0)

    const folderParams = {
      parentId: rootId,
      title: datedTitle,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    foundFolder = await createFolderIgnoreInController(folderParams)
  }

  return foundFolder
}

export async function getOrCreateFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == OTHER_BOOKMARKS_FOLDER_ID)

  if (foundItem) {
    return foundItem.id
  }

  const folder = {
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  }
  const newNode = await createFolderIgnoreInController(folder)

  return newNode.id
}

export async function removeFolder(bkmId) {
  await chrome.bookmarks.remove(bkmId)
}
