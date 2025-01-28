import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
} from './special-folder.js';
import {
  findFolderWithExactTitle,
} from './find-folder.js'
import {
  createFolderIgnoreInController,
} from './folder-crud.js'
import {
  getDatedTitle,
  isDatedFolderTemplate,
  isDatedTitleForTemplate,
} from './folder-title-dated.js';
import {
  makeLogFunction,
} from '../api-low/index.js';

const logFD = makeLogFunction({ module: 'folder-dated.js' })

// folderTitle = 'DONE @D' 'selected @D' 'BEST @D'
export async function getDatedFolder(templateTitle) {
  if (!isDatedFolderTemplate(templateTitle)) {
    return
  }
  logFD('getDatedFolder () 00', templateTitle)

  const datedTitle = getDatedTitle(templateTitle)
  logFD('getDatedFolder () 11', 'datedTitle', datedTitle)
  const rootId = BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
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

export async function removePreviousDatedBookmarks({ url, template }) {
  const bookmarkList = await chrome.bookmarks.search({ url });
  logFD('removePreviousDatedBookmarks () 00', bookmarkList)

  const parentIdList = bookmarkList.map(({ parentId }) => parentId)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  const parentFolderList = await chrome.bookmarks.get(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title}) => [id, title])
  )

  const removeFolderList = bookmarkList
    .map(({ id, parentId }) => ({ id, parentTitle: parentMap[parentId] }))
    .filter(({ parentTitle }) => isDatedTitleForTemplate({ title: parentTitle, template }))
    .toSorted((a,b) => a.parentTitle.localeCompare(b.parentTitle))
    .slice(1)
  logFD('removePreviousDatedBookmarks () 00', 'removeFolderList', removeFolderList)

  if (removeFolderList.length == 0) {
    return
  }

  await Promise.all(
    removeFolderList.map(
      ({ id }) => chrome.bookmarks.remove(id)
    )
  )
}
