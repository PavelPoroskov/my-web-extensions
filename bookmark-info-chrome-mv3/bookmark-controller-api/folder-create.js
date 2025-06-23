import {
  makeLogFunction,
} from '../api-low/index.js';
import {
  findFolder,
  findSubFolderWithExactTitle,
  getDatedTitle,
  getNewFolderRootId,
  getTitleDetails,
  getTitleWithDirectives,
  isChangesInDirectives,
  isDatedFolderTemplate,
  makeCompareDatedTitleWithFixed,
  OTHER_BOOKMARKS_FOLDER_ID,
} from '../folder-api/index.js';
import {
  createFolderIgnoreInController,
  updateFolder,
} from './folder-ignore.js'
import {
  moveFolderAfterRename
} from './folder-move.js'

const logFCR = makeLogFunction({ module: 'folder-create.js' })

export async function _findOrCreateFolder(title) {
  const {
    onlyTitle: newOnlyTitle,
    objDirectives: objNewDirectives,
  } = getTitleDetails(title)
  let folder = await findFolder(newOnlyTitle)

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

    folder = await createFolderIgnoreInController(folderParams)
  } else {
    const {
      onlyTitle: oldOnlyTitle,
      objDirectives: objOldDirectives,
    } = getTitleDetails(folder.title)

    const oldBigLetterN = oldOnlyTitle.replace(/[^A-Z]+/g, "").length
    const newBigLetterN = newOnlyTitle.replace(/[^A-Z]+/g, "").length
    // const isAbbreviation = title.length == newBigLetterN
    logFCR('findOrCreateFolder () 22', oldBigLetterN, newBigLetterN)

    const oldDashN = oldOnlyTitle.replace(/[^-]+/g,"").length
    const newDashN = newOnlyTitle.replace(/[^-]+/g,"").length

    const isUseNewTitle = oldBigLetterN < newBigLetterN || newDashN < oldDashN
    const hasChangesInDirectives = isChangesInDirectives({ oldDirectives: objOldDirectives, newDirectives: objNewDirectives })

    let actualOnlyTitle = isUseNewTitle ? newOnlyTitle : oldOnlyTitle

    if (isUseNewTitle || hasChangesInDirectives) {
      const objSumDirectives = Object.assign({}, objOldDirectives, objNewDirectives)
      const newTitle = getTitleWithDirectives({ onlyTitle: actualOnlyTitle, objDirectives: objSumDirectives })

      await updateFolder({ id: folder.id, title: newTitle })
      await moveFolderAfterRename({
        id: folder.id,
        title: newTitle,
        parentId: folder.parentId,
        index: folder.index,
      })
    }
  }

  return folder.id
}

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
export async function _findOrCreateDatedFolder({ templateTitle, parentId }) {
  if (!isDatedFolderTemplate(templateTitle)) {
    return
  }
  logFCR('_findOrCreateDatedFolder () 00', templateTitle)

  const datedTitle = getDatedTitle(templateTitle)
  logFCR('_findOrCreateDatedFolder () 11', 'datedTitle', datedTitle)
  let foundFolder = await findSubFolderWithExactTitle({ title: datedTitle, parentId })

  if (!foundFolder) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
    const compareDatedTitleWithFixed = makeCompareDatedTitleWithFixed(datedTitle)
    const findIndex = firstLevelNodeList.find((node) => !node.url && compareDatedTitleWithFixed(node.title) < 0)

    const folderParams = {
      parentId,
      title: datedTitle,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    foundFolder = await createFolderIgnoreInController(folderParams)
  }

  return foundFolder.id
}

export async function _findFolder(title) {
  // const folder = await findFolder(title)
  const folder = await findSubFolderWithExactTitle({ title, parentId: OTHER_BOOKMARKS_FOLDER_ID })

  if (folder) {
    return folder.id
  }
}
