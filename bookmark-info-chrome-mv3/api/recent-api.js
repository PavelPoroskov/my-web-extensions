import {
  log,
} from './log-api.js'


const EMPTY_FOLDER_NAME_LIST = [
  'New folder',
  '[Folder Name]',
]

export const emptyFolderNameSet = new Set(EMPTY_FOLDER_NAME_LIST)

async function getRecentList(nItems) {
  log('getRecentTagObj() 00', nItems)
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

  const unknownFolderList = await chrome.bookmarks.get(unknownIdList)
  unknownFolderList.forEach(({ id, title }) => {
    folderByIdMap[id].title = title
  })

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
    .filter(({ title }) => !emptyFolderNameSet.has(title))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
}

export async function getRecentTagObj(nItems) {
  let list = await getRecentList(nItems * 4)

  if (list.length < nItems) {
    list = await getRecentList(nItems * 10)
  }

  return Object.fromEntries(
    list
      .slice(0, nItems)
      .map(({ parentId, title, dateAdded }) => [parentId, { title, dateAdded }])
  )
}

export async function filterRecentTagObj(inObj = {}) {
  const idList = Object.keys(inObj)

  if (idList.length === 0) {
    return {}
  }

  const folderList = await chrome.bookmarks.get(idList)
  const filteredFolderList = folderList
    .filter(Boolean)
    .filter(({ title }) => !!title)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [
      id, 
      {
        title, 
        dateAdded: inObj[id].dateAdded,
      }
    ])
  )
}

export async function filterFixedTagObj(obj = {}) {
  const idList = Object.keys(obj)

  if (idList.length === 0) {
    return {}
  }

  const folderList = await chrome.bookmarks.get(idList)
  const filteredFolderList = folderList
    .filter(Boolean)
    .filter(({ title }) => !!title)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [id, title])
  )
}