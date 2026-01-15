import {
  findFolder,
  getTitleDetails,
  getTitleWithDirectives,
  isChangesInDirectives,
} from '../folder-api/index.js';
import {
  updateFolder,
} from '../bookmark-controller-api/folder-ignore.js'
import {
  moveFolderAfterRename
} from '../bookmark-controller-api/folder-move.js'

async function mergeFolderTitle({ oldTitle, newTitle }) {
  const {
    onlyTitle: oldOnlyTitle,
    objDirectives: objOldDirectives,
  } = getTitleDetails(oldTitle)

  const {
    onlyTitle: newOnlyTitle,
    objDirectives: objNewDirectives,
  } = getTitleDetails(newTitle)

  const oldBigLetterN = oldOnlyTitle.replace(/[^A-Z]+/g, "").length
  const newBigLetterN = newOnlyTitle.replace(/[^A-Z]+/g, "").length

  const oldDashN = oldOnlyTitle.replace(/[^-]+/g,"").length
  const newDashN = newOnlyTitle.replace(/[^-]+/g,"").length

  const isUseNewTitle = oldBigLetterN < newBigLetterN || newDashN < oldDashN
  const actualOnlyTitle = isUseNewTitle ? newOnlyTitle : oldOnlyTitle

  const hasChangesInDirectives = isChangesInDirectives({ oldDirectives: objOldDirectives, newDirectives: objNewDirectives })

  if (hasChangesInDirectives || isUseNewTitle) {
    const objSumDirectives = Object.assign({}, objOldDirectives, objNewDirectives)
    const mergedTitle = getTitleWithDirectives({ onlyTitle: actualOnlyTitle, objDirectives: objSumDirectives })

    return mergedTitle
  }
}

async function mergeFolderTitleToNode({ folder, newTitle }) {
  const mergedTitle = mergeFolderTitle({ oldTitle: folder.title, newTitle })

  if (mergedTitle) {
    await updateFolder({ id: folder.id, title: mergedTitle })
    await moveFolderAfterRename({
      id: folder.id,
      title: mergedTitle,
      parentId: folder.parentId,
      index: folder.index,
    })

    return mergedTitle
  }

  return folder.title
}

export async function findFolderInBookmarks(title) {
  const folder = await findFolder(title)

  if (folder) {
    const mergedTitle = await mergeFolderTitleToNode({
      folder,
      newTitle: title,
    })

    const {
      objDirectives
    } = getTitleDetails(mergedTitle)

    return {
      id: folder.id,
      ...(Object.keys(objDirectives || {}).length > 0
        ? { objDirectives: objDirectives }
        : undefined
      )
    }
  }
}
