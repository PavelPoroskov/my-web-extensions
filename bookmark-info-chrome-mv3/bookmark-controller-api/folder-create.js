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
  // rootFolders,
} from '../folder-api/index.js';
import {
  createFolderIgnoreInController,
  updateFolder,
} from './folder-ignore.js'
// import {
//   moveFolderAfterRename
// } from './folder-move.js'

const logFCR = makeLogFunction({ module: 'folder-create.js' })

export async function _findOrCreateFolder(title) {
  // logFCR('_findOrCreateFolder 00 1 title', title)
  let objSumDirectives

  const {
    onlyTitle: newOnlyTitle,
    objDirectives: objNewDirectives,
  } = getTitleDetails(title)
  // logFCR('_findOrCreateFolder 00 2', newOnlyTitle)
  let folder = await findFolder(newOnlyTitle)
  // logFCR('_findOrCreateFolder 00 3', folder)

  if (!folder) {
    const parentId = getNewFolderRootId(title)
    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    // logFCR('_findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    folder = await createFolderIgnoreInController(folderParams)
  } else {
    // logFCR('_findOrCreateFolder 22 1', folder.title)
    const {
      onlyTitle: oldOnlyTitle,
      objDirectives: objOldDirectives,
    } = getTitleDetails(folder.title)

    // const oldBigLetterN = oldOnlyTitle.replace(/[^A-Z]+/g, "").length
    // const newBigLetterN = newOnlyTitle.replace(/[^A-Z]+/g, "").length

    // const oldDashN = oldOnlyTitle.replace(/[^-]+/g,"").length
    // const newDashN = newOnlyTitle.replace(/[^-]+/g,"").length

    // const isUseNewTitle = oldBigLetterN < newBigLetterN || newDashN < oldDashN
    const hasChangesInDirectives = isChangesInDirectives({ oldDirectives: objOldDirectives, newDirectives: objNewDirectives })

    // let actualOnlyTitle = isUseNewTitle ? newOnlyTitle : oldOnlyTitle
    // if (isUseNewTitle || hasChangesInDirectives) {
      // const newTitle = getTitleWithDirectives({ onlyTitle: actualOnlyTitle, objDirectives: objSumDirectives })
    if (hasChangesInDirectives) {
      // logFCR('_findOrCreateFolder 22 33', isUseNewTitle, hasChangesInDirectives)
      objSumDirectives = Object.assign({}, objOldDirectives, objNewDirectives)
      const newTitle = getTitleWithDirectives({ onlyTitle: oldOnlyTitle, objDirectives: objSumDirectives })

      await updateFolder({ id: folder.id, title: newTitle })
      // await moveFolderAfterRename({
      //   id: folder.id,
      //   title: newTitle,
      //   parentId: folder.parentId,
      //   index: folder.index,
      // })
    }
  }

  return {
    id: folder.id,
    objDirectives: objSumDirectives || objNewDirectives,
  }
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

  return { id: foundFolder.id }
}

export async function _findFolder(title) {
  const folder = await findFolder(title)
  // const folder = await findSubFolderWithExactTitle({ title, parentId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })

  if (folder) {
    return { id: folder.id }
  }
}
