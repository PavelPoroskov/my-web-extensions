import {
  rootFolders,
} from './root-folders.js';

export function isTopFolder(folderName) {
  const name = folderName.trim().toLowerCase()

  return name.startsWith('todo')
    || name.startsWith('source')
    || name.startsWith('list') || name.endsWith('list')
    || name.endsWith('#top')
}

export function getNewFolderRootId(folderName) {
  if (isTopFolder(folderName)) {
    return rootFolders.BOOKMARKS_BAR_FOLDER_ID
  }

  return rootFolders.OTHER_BOOKMARKS_FOLDER_ID
}
