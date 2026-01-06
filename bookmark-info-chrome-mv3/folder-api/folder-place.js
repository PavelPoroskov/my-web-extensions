import {
  rootFolders,
} from './root-folders.js';

export function isTopFolder(folderName) {
  const wordList = folderName.trim().toLowerCase().split(' ').filter(Boolean)
  const wordSet = new Set(wordList)

  return wordSet.has('#top')
}

export function getNewFolderRootId(folderName) {
  if (isTopFolder(folderName)) {
    return rootFolders.BOOKMARKS_BAR_FOLDER_ID
  }

  return rootFolders.OTHER_BOOKMARKS_FOLDER_ID
}
