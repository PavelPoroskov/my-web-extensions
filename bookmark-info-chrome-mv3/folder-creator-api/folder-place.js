import {
  BOOKMARKS_BAR_FOLDER_TITLE,
  OTHER_BOOKMARKS_FOLDER_TITLE,
  DATED_ROOT_NEW_FOLDER_TITLE,
  DATED_ROOT_OLD_FOLDER_TITLE,
  DATED_ROOT_SERVICE_FOLDER_TITLE,
  DATED_TEMPLATE_VISITED,
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_DONE,
} from './special-folders.js';
import {
  isDatedFolderTitle,
  getDatedTemplate,
} from '../folder-api/index.js';

const datedTemplatesInDatedRootServiceSet = new Set([
  DATED_TEMPLATE_VISITED,
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_DONE
])

// getFolderPlaceTitleByTitle
export function getNewFolderPlaceParentTitle(folderTitle) {
  const isTopFolder = folderTitle.includes(' #top')

  if (isTopFolder) {
    return BOOKMARKS_BAR_FOLDER_TITLE
  }

  if (isDatedFolderTitle(folderTitle)) {
    const datedTemplate = getDatedTemplate(folderTitle)

    if (datedTemplatesInDatedRootServiceSet.has(datedTemplate)) {
      return DATED_ROOT_SERVICE_FOLDER_TITLE
    }

    return DATED_ROOT_NEW_FOLDER_TITLE
  }

  return OTHER_BOOKMARKS_FOLDER_TITLE
}

export function getExistingFolderPlaceParentTitleList(folderTitle) {
  const parentTitle = getNewFolderPlaceParentTitle(folderTitle)

  if (parentTitle == DATED_ROOT_NEW_FOLDER_TITLE) {
    return [
      DATED_ROOT_NEW_FOLDER_TITLE,
      DATED_ROOT_OLD_FOLDER_TITLE,
    ]
  }

  return [parentTitle]
}
