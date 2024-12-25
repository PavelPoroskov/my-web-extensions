import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';
import {
  ignoreBkmControllerApiActionSet,
} from './structure/ignoreBkmControllerApiActionSet.js';

export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'


async function getOrCreateFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundItem) {
    return foundItem.id
  }

  const folder = {
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  }
  ignoreBkmControllerApiActionSet.addIgnoreCreate(folder)
  const newNode = await chrome.bookmarks.create(folder)

  return newNode.id
}

async function getFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

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

export const getOrCreateUnclassifiedFolderId = async () => getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
export const getUnclassifiedFolderId = memoize(async () => getFolderByTitleInRoot(UNCLASSIFIED_TITLE))

export const isDescriptiveFolderTitle = (title) => !!title
  && !(
    title.startsWith('New folder')
    || title.startsWith('[Folder Name]')
    || title.startsWith('New Folder')
    || title.startsWith('(to title)')
  )
