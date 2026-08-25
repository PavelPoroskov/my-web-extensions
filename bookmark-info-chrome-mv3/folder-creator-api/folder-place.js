import {
  BOOKMARKS_BAR_FOLDER_TITLE,
  OTHER_BOOKMARKS_FOLDER_TITLE,
  DATED_ROOT_NEW_FOLDER_TITLE,
  // DATED_ROOT_OLD_FOLDER_TITLE,
  DATED_ROOT_SERVICE_FOLDER_TITLE,
  DATED_TEMPLATE_VISITED,
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_DONE,

  isDatedFolderTitle,
  getDatedTemplate,
} from '../folder-api/index.js';

const datedTemplatesInDatedRootServiceSet = new Set([
  DATED_TEMPLATE_VISITED,
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_DONE
])

export function getFolderInfo(title) {

  let info

  switch (true) {
    case title.includes(' #top-'): {
      info = {
        parentTitle: OTHER_BOOKMARKS_FOLDER_TITLE,
        folderType: 'top folder placeholder'
      }
      break
    }
    case title.includes(' #top'): {
      info = {
        parentTitle: BOOKMARKS_BAR_FOLDER_TITLE,
        folderType: 'top folder'
      }
      break
    }
    case isDatedFolderTitle(title): {
      const datedTemplate = getDatedTemplate(title)

      if (datedTemplatesInDatedRootServiceSet.has(datedTemplate)) {
        info = {
          parentTitle: DATED_ROOT_SERVICE_FOLDER_TITLE,
          folderType: 'service folder'
        }
      } else {
        info = {
          parentTitle: DATED_ROOT_NEW_FOLDER_TITLE,
          folderType: 'dated folder'
        }
      }

      break
    }
    default:
      info = {
        parentTitle: OTHER_BOOKMARKS_FOLDER_TITLE
      }
  }

  return {
    ...info,
    title,
  }
}
