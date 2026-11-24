import {
  normalizeTitle,
  getTitleDetails,
} from '../folder-api/index.js';
import {
  rootFolders,
} from '../folder-creator-api/index.js'


// export async function getFolderDirectives(title) {
//   const folder = await getFolderInOthers(title)

//   if (folder) {
//     return getTitleDetails(folder.title).objDirectives
//   }

//   return {}
// }

// export async function isTopFolder(title) {
//   const objDirectives = await getFolderDirectives(title)

//   return (objDirectives['#top'] !== undefined)
// }

export async function makeIsTopFolder() {
  const otherNodeList = await chrome.bookmarks.getChildren(rootFolders.OTHER_BOOKMARKS_FOLDER_ID)
  const otherFolderList = otherNodeList
    .filter(({ url, title }) => !url && (title.endsWith(' #top') || title.includes(' #top ')))
    .map(({ id, title }) => ({
      id,
      titleNormalized: normalizeTitle(getTitleDetails(title).onlyTitle)
    }))

  function findOtherFolder(title) {
    const onlyTitle = getTitleDetails(title).onlyTitle
    const searchPattern = normalizeTitle(onlyTitle)

    const foundItem = otherFolderList.find((node) => searchPattern == node.titleNormalized)

    return foundItem
  }

  return (title) => {
    const folder = findOtherFolder(title)

    return !!folder
  }
}
