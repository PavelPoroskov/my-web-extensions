import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';
import {
  createFolderIgnoreInController
} from './folder.api.js'

export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'


async function getOrCreateFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == OTHER_BOOKMARKS_FOLDER_ID)

  if (foundItem) {
    return foundItem.id
  }

  const folder = {
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  }
  const newNode = await createFolderIgnoreInController(folder)

  return newNode.id
}

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

const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'
const DATED_TITLE = 'zz-bookmark-info--dated'

export const getOrCreateUnclassifiedFolderId = async () => getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
export const getUnclassifiedFolderId = memoize(async () => getFolderByTitleInRoot(UNCLASSIFIED_TITLE))

export const getOrCreateDatedRootFolderId = async () => getOrCreateFolderByTitleInRoot(DATED_TITLE)
export const getDatedRootFolderId = memoize(async () => getFolderByTitleInRoot(DATED_TITLE))

export const isDescriptiveFolderTitle = (title) => !!title
  && !(
    title.startsWith('New folder')
    || title.startsWith('[Folder Name]')
    || title.startsWith('New Folder')
    || title.startsWith('(to title)')
  )
