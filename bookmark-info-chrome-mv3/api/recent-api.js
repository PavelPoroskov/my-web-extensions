import {
  log,
} from './debug.js'

export async function getRecentTagList(nItems) {
  log('getRecentTagList() 00', nItems)
  const list = await chrome.bookmarks.getRecent(nItems*3);

  const folderList = list
    .filter(({ url }) => !url)

  const folderByIdMap = Object.fromEntries(
    folderList.map(({ id, title, dateAdded}) => [
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

  const unknownFolderList = await chrome.bookmarks.get(unknownIdList)
  unknownFolderList.forEach(({ id, title }) => {
    folderByIdMap[id].title = title
  })

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
    .slice(0, nItems)
}

export async function filterFixedTagList(list = []) {
  const idList = list.map(({ parentId }) => parentId)

  if (idList.length === 0) {
    return []
  }

  const folderList = await chrome.bookmarks.get(idList)

  return folderList
    .filter(Boolean)
    .map(({ id, title }) => ({ parentId: id, title }))
}