import {
  isDatedFolderTitle,
  isServiceDatedTemplate,
} from './folder-dated-title.js';
import {
  BOOKMARKS_BAR_FOLDER_ID,
  BOOKMARKS_MENU_FOLDER_ID,
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.js';

export function isTopFolder(folderName) {
  const name = folderName.trim().toLowerCase()

  return name.startsWith('todo')
    || name.startsWith('source')
    || name.startsWith('list') || name.endsWith('list')
    || name.endsWith('#top')
}

export function getNewFolderRootId(folderName) {
  if (isTopFolder(folderName)) {
    return BOOKMARKS_BAR_FOLDER_ID
  }

  if (isDatedFolderTitle(folderName)) {
    // BOOKMARKS_MENU_FOLDER_ID for Firefox, BOOKMARKS_BAR_FOLDER_ID for Chrome
    return BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
  }

  return OTHER_BOOKMARKS_FOLDER_ID
}

export function getNewFolderRootIdForDated(templateTitle, templateId) {

  if (isServiceDatedTemplate(templateTitle)) {
    return templateId
  }

  return BOOKMARKS_MENU_FOLDER_ID || BOOKMARKS_BAR_FOLDER_ID
}
