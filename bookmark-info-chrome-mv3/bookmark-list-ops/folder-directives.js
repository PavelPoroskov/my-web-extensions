import {
  makeIsTitleMatch,
  normalizeTitle,
  getTitleDetails,
} from '../folder-api/index.js';
import {
  rootFolders,
} from '../folder-creator-api/index.js'

export async function findChildFolder({ title, parentId }) {
  const onlyTitle = getTitleDetails(title).onlyTitle
  const isTitleMatch = makeIsTitleMatch({ title: onlyTitle, normalizeFn: normalizeTitle })

  // const nodeList = await chrome.bookmarks.getChildren(parentId)
  // const foundItem = nodeList.find((node) => !node.url && isTitleMatch(node.title))

  const nodeList = await chrome.bookmarks.search(onlyTitle);
  const foundItem = nodeList.find((node) => !node.url && node.parentId == parentId && isTitleMatch(node.title))

  return foundItem
}

export async function getFolderInOthers(title) {
  const onlyTitle = getTitleDetails(title).onlyTitle

  const folder = await findChildFolder({ title: onlyTitle, parentId: rootFolders.OTHER_BOOKMARKS_FOLDER_ID })

  return folder
}

export async function getFolderDirectives(title) {
  const folder = await getFolderInOthers(title)

  if (folder) {
    return getTitleDetails(folder.title).objDirectives
  }

  return {}
}

export async function isTopFolder(title) {
  const objDirectives = await getFolderDirectives(title)

  return (objDirectives['#top'] !== undefined)
}
