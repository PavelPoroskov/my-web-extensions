import {
  IS_BROWSER_FIREFOX,
} from '../constant/index.js';

export const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
export const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'

async function getFolderByTitleInRoot({ title, oldTitle }) {
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)

  const foundOldItem = nodeList.find((node) => !node.url && node.title === oldTitle)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundOldItem && !foundItem) {
    await chrome.bookmarks.update(
      foundOldItem.id,
      { title }
    )

    return foundOldItem.id
  }

  if (foundItem) {
    return foundItem.id
  }
}

async function getOrCreateFolderByTitleInRoot({ title, oldTitle }) {
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)

  const foundOldItem = nodeList.find((node) => !node.url && node.title === oldTitle)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundOldItem && !foundItem) {
    await chrome.bookmarks.update(
      foundOldItem.id,
      { title }
    )

    return foundOldItem.id
  }

  if (foundItem) {
    return foundItem.id
  }

  const newNode = await chrome.bookmarks.create({
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  })

  return newNode.id
}

function memoize({ fnGetValue, fnGetOrCreateValue }) {
  let isGetValueWasGet = false
  let getValue
  let getOrCreateValue

  return {
    async get () {
      if (isGetValueWasGet) {
        return getValue 
      }
  
      isGetValueWasGet = true

      return getValue = fnGetValue()
    },
    async getOrCreate () {
      if (getOrCreateValue) {
        return getOrCreateValue
      }
  
      return getOrCreateValue = fnGetOrCreateValue().then((result) => {
        isGetValueWasGet = false

        return result
      })
    },
  }
}

const NESTED_ROOT_TITLE_OLD = 'yy-bookmark-info--nested'
const NESTED_ROOT_TITLE = 'zz-bookmark-info--nested'

const UNCLASSIFIED_TITLE_OLD = 'unclassified'
const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

export const {
  get: getNestedRootFolderId,
  getOrCreate: getOrCreateNestedRootFolderId
} = memoize({
  fnGetValue: async () => getFolderByTitleInRoot({ title: NESTED_ROOT_TITLE, oldTitle: NESTED_ROOT_TITLE_OLD }),
  fnGetOrCreateValue: async () => getOrCreateFolderByTitleInRoot({ title: NESTED_ROOT_TITLE, oldTitle: NESTED_ROOT_TITLE_OLD })
})
export const getOrCreateUnclassifiedFolderId = async () => getOrCreateFolderByTitleInRoot({ title: UNCLASSIFIED_TITLE, oldTitle: UNCLASSIFIED_TITLE_OLD })
