import {
  OTHER_BOOKMARKS_FOLDER_TITLE,
  DATED_ROOT_NEW_FOLDER_TITLE,
  DATED_ROOT_SERVICE_FOLDER_TITLE,

  isDatedFolderTitle,
  isDatedServiceTitle,
} from '../folder-api/index.js';

export function getFolderInfo(title) {

  let specialInfo

  switch (true) {
    case title.includes(' #top'): {
      specialInfo = {
        folderType: 'top folder'
      }
      break
    }
    case isDatedFolderTitle(title): {

      if (isDatedServiceTitle(title)) {
        specialInfo = {
          parentTitle: DATED_ROOT_SERVICE_FOLDER_TITLE,
          folderType: 'service folder'
        }
      } else {
        specialInfo = {
          parentTitle: DATED_ROOT_NEW_FOLDER_TITLE,
          folderType: 'dated folder'
        }
      }

      break
    }
  }

  return {
    title,
    parentTitle: OTHER_BOOKMARKS_FOLDER_TITLE,
    ...specialInfo,
  }
}
