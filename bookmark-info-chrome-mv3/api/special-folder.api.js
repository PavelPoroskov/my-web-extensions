import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'

async function getOrCreateFolderByTitleInRoot(title) {
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundItem) {
    return foundItem.id
  }

  const newNode = await chrome.bookmarks.create({
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  })

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

// const NESTED_ROOT_TITLE_OLD = 'yy-bookmark-info--nested'
const NESTED_ROOT_TITLE = 'zz-bookmark-info--nested'

// const UNCLASSIFIED_TITLE_OLD = 'unclassified'
const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

export const getOrCreateNestedRootFolderId = async () => getOrCreateFolderByTitleInRoot(NESTED_ROOT_TITLE)
export const getOrCreateUnclassifiedFolderId = async () => getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)

export const getNestedRootFolderId = memoize(async () => getFolderByTitleInRoot(NESTED_ROOT_TITLE))
export const getUnclassifiedFolderId = memoize(async () => getFolderByTitleInRoot(UNCLASSIFIED_TITLE))

export const isDescriptiveTitle = (title) => !(title.startsWith('New folder') || title.startsWith('[Folder Name]') || title.startsWith('New Folder')) 