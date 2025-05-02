import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'

async function getFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == OTHER_BOOKMARKS_FOLDER_ID)

  if (foundItem) {
    return foundItem.id
  }
}

function memoize(fnGetValue) {
  let isValueWasGet = false
  let value

  return async function () {
    if (isValueWasGet) {
      return value
    }

    isValueWasGet = true

    return value = fnGetValue()
  }
}

export const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

export const getUnclassifiedFolderId = memoize(async () => getFolderByTitleInRoot(UNCLASSIFIED_TITLE))
