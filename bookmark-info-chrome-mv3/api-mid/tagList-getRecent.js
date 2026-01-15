import {
  isIgnoreInRecentList,
  isDatedFolderTitle,
  isDescriptiveFolderTitle,
  isVisitedDatedTemplate,
} from '../folder-api/index.js'
import {
  rootFolders,
} from '../folder-creator-api/root-folders.js'
import {
  getBookmarkNodeList,
} from '../bookmark-list-api/bookmark-list.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logRA = makeLogFunction({ module: 'tagList-getRecent.js' })

async function getRecentList(nItems) {
  const list = await chrome.bookmarks.getRecent(nItems);
  const folderList = list
    .filter(({ url }) => !url)

  const folderByIdMap = Object.fromEntries(
    folderList.map(({ id, title, dateAdded }) => [
      id,
      {
        title,
        dateAdded,
        isSourceFolder: true,
      }
    ])
  )

  const bookmarkList = list.filter(({ url }) => url)
  bookmarkList.forEach(({ parentId, dateAdded }) => {
    folderByIdMap[parentId] = {
      ...folderByIdMap[parentId],
      dateAdded: Math.max(folderByIdMap[parentId]?.dateAdded || 0, dateAdded)
    }
  })

  const unknownIdList = Object.entries(folderByIdMap)
    .filter(([, { isSourceFolder }]) => !isSourceFolder)
    .map(([id]) => id)

  const unknownFolderList = await getBookmarkNodeList(unknownIdList)
  unknownFolderList.forEach(({ id, title }) => {
    folderByIdMap[id].title = title
  })

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, parentTitle: title, dateAdded }))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
}

export async function getRecentTagObj(nItems) {
  let list = await getRecentList(nItems * 4)
  logRA('getRecentTagObj () 11', list.length, list)

  if (0 < list.length && list.length < nItems) {
    list = await getRecentList(nItems * 10)
    logRA('getRecentTagObj () 22', list.length, list)
  }

  return Object.fromEntries(
    list
      .slice(0, nItems)
      .map(({ parentId, parentTitle, dateAdded }) => [parentId, { parentTitle, dateAdded }])
  )
}

async function filterFolders(idList, isFlatStructure) {
  logRA('filterFolders () 00', idList.length, idList )
  if (idList.length === 0) {
    return []
  }

  const folderList = await getBookmarkNodeList(idList)
  logRA('filterFolders () 22', 'folderList', folderList.length, folderList)
  let filteredFolderList = folderList
    .filter(({ title }) => !!title)
    .filter(({ title }) => isDescriptiveFolderTitle(title))
    .filter(({ title }) => !isDatedFolderTitle(title))
    .filter(({ title }) => !isVisitedDatedTemplate(title))

  // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
  if (isFlatStructure) {
    filteredFolderList = filteredFolderList
      .filter(
        ({ parentId }) => parentId === rootFolders.OTHER_BOOKMARKS_FOLDER_ID || parentId === rootFolders.BOOKMARKS_BAR_FOLDER_ID
      )
      .filter(
        ({ title }) => !isIgnoreInRecentList(title)
      )
  }
  logRA('filterFolders () 33', 'filteredFolderList', filteredFolderList.length, filteredFolderList)

  return filteredFolderList
}

export async function filterRecentTagObj(obj = {}, isFlatStructure) {
  logRA('filterRecentTagObj () 00')
  const filteredFolderList = await filterFolders(Object.keys(obj), isFlatStructure)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [
      id,
      {
        parentTitle: title,
        dateAdded: obj[id].dateAdded,
      }
    ])
  )
}
