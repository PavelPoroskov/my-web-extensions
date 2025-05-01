import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  OTHER_BOOKMARKS_FOLDER_ID,
  findFolder,
  findFolderWithExactTitle,
  getDatedTitle,
  isDatedFolderTemplate,
  getNewFolderRootId,
  getNewFolderRootIdForDated,
} from '../folder-api/index.js';
import {
  createFolderIgnoreInController,
  createFolder,
  updateFolder,
} from './folder-ignore.js'

const logFCR = makeLogFunction({ module: 'folder-create.js' })

export async function findOrCreateFolder(title) {
  let folder = await findFolder(title)

  if (!folder) {
    const parentId = getNewFolderRootId(title)
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

    folder = await createFolder(folderParams)
  } else {
    const oldBigLetterN = folder.title.replace(/[^A-Z]+/g, "").length
    const newBigLetterN = title.replace(/[^A-Z]+/g, "").length
    // const isAbbreviation = title.length == newBigLetterN
    logFCR('findOrCreateFolder () 22', oldBigLetterN, newBigLetterN)

    if (oldBigLetterN < newBigLetterN) {
      await updateFolder({ id: folder.id, title })
    }

    const oldDashN = folder.title.replace(/[^-]+/g,"").length
    const newDashN = title.replace(/[^-]+/g,"").length
    if (newDashN < oldDashN) {
      await updateFolder({ id: folder.id, title })
    }
  }

  return folder
}

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
export async function findOrCreateDatedFolder({ templateTitle, templateId }) {
  if (!isDatedFolderTemplate(templateTitle)) {
    return
  }
  logFCR('findOrCreateDatedFolder () 00', templateTitle)

  const datedTitle = getDatedTitle(templateTitle)
  logFCR('findOrCreateDatedFolder () 11', 'datedTitle', datedTitle)
  const rootId = getNewFolderRootIdForDated(templateTitle, templateId)
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

export async function findOrCreateFolderByTitleInRoot(title) {
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
