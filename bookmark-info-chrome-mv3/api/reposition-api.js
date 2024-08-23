
import {
  OTHER_BOOKMARKS_FOLDER_ID,
} from './special-folder.api.js'
import {
  memo,
} from './structure/index.js'
import {
  isSupportedProtocol,
} from './common-api.js'

const TEMP_BOOKMARK_SUFFIX = ' #reposition'
const TEMP_BOOKMARK_URL = 'https://fake.bookmark.url/'

export function isTempBookmarkNode(node) {
  return node.parentId === OTHER_BOOKMARKS_FOLDER_ID  && !!node.url && node.title.endsWith(TEMP_BOOKMARK_SUFFIX)
}
function markTempBookmarkTitle(title) {
  return `${title}${TEMP_BOOKMARK_SUFFIX}`
}
export function clearTempBookmarkTitle(title) {
  return title.replace(TEMP_BOOKMARK_SUFFIX, '')
}

export async function repositionLastBookmarkOnTabActivated({ url, title }) {
  if (!isSupportedProtocol(url)) {
    return;
  }
  console.log('repositionLastBookmarkOnTabActivated()')
  const [
    bookmarkForUrlList,
    recentBookmarkList,
  ] = await Promise.all([
    chrome.bookmarks.search({ url }),
    chrome.bookmarks.getRecent(1),
  ]);

  const lastBookmarkForUrl = bookmarkForUrlList.sort(({ dateAdded: a }, { dateAdded: b }) => a - b).at(-1);
  const [lastRecentBookmark] = recentBookmarkList

  const isYet = (lastBookmarkForUrl && isTempBookmarkNode(lastBookmarkForUrl)) 
    || (!lastBookmarkForUrl && lastRecentBookmark && isTempBookmarkNode(lastRecentBookmark)) 
  if (isYet) {
    return
  }

  const tempBkmId = memo.urlToTempBkmIdMap.get(url)

  if (tempBkmId) {
    memo.urlToTempBkmIdMap.delete(url)
    console.log('before deleted temp bookmark 11', tempBkmId)
    try {
      await chrome.bookmarks.remove(tempBkmId)
    // eslint-disable-next-line no-unused-vars, no-empty
    } catch (er) {
      console.log('Ignoring deleted temp bookmark', er)
    }
    console.log('deleted temp bookmark')
  }

  const newNode = await chrome.bookmarks.create({
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    url: lastBookmarkForUrl
      ? url 
      : TEMP_BOOKMARK_URL,
    title: markTempBookmarkTitle(title),
  })
  memo.urlToTempBkmIdMap.set(url, newNode.id)
  console.log('create temp bookmark', newNode)
}

export async function repositionLastBookmarkOnCreated(node) {
  const { url } = node
  if (!isSupportedProtocol(url)) {
    return;
  }

  if (isTempBookmarkNode(node)) {
    return
  }
  console.log('repositionLastBookmarkOnCreated()')

  const tempBkmId = memo.urlToTempBkmIdMap.get(url)

  if (tempBkmId) {
    memo.urlToTempBkmIdMap.delete(url)
    console.log('before deleted temp bookmark 22', tempBkmId)
    try {
      await chrome.bookmarks.remove(tempBkmId)
    // eslint-disable-next-line no-unused-vars, no-empty
    } catch (er) {
      console.log('Ignoring deleted temp bookmark', er)
    }
    console.log('deleted temp bookmark')
  }

  const newNode = await chrome.bookmarks.create({
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    url,
    title: markTempBookmarkTitle(node.title),
  })
  memo.urlToTempBkmIdMap.set(url, newNode.id)
  console.log('create temp bookmark', newNode)
}

export async function clearTempBkmForUrl(url) {
  console.log('clearTempBkmForUrl 11', url)
  // const bookmarkForUrlList = await chrome.bookmarks.search({ url })
  // const deleteList = bookmarkForUrlList
  //   .filter(isTempBookmarkNode)
  //   .map(({ id }) => id)

  // await Promise.all(
  //   deleteList.map(
  //     (id) => chrome.bookmarks.remove(id)
  //   )
  // )

  const bkmId = memo.urlToTempBkmIdMap.get(url)

  if (bkmId) {
    try {
      console.log('clearTempBkmForUrl 11', bkmId)
      await chrome.bookmarks.remove(bkmId)
    // eslint-disable-next-line no-empty
    } finally {

    }
  }
}

export async function clearTempBkmForTab(tabId) {
  console.log('clearTempBkmForTab 11', tabId)
  const url = memo.tabIdToUrlMap.get(tabId)

  if (url) {
    await clearTempBkmForUrl(url)
  }
}

async function clearTempBkm() {
  // await clearTempBkmForUrl(TEMP_BOOKMARK_URL)

  console.log('clearTempBkm 11')
  const nodeList = await chrome.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)

  const deleteList = nodeList
    .filter((node) => node.url)
    .filter(isTempBookmarkNode)
    .map(({ id }) => id)

  await Promise.allSettled(
    deleteList.map(
      (id) => chrome.bookmarks.remove(id)
    )
  )
}

function makeRunOnce(fn) {
  let isCalled = false

  return () => {
    if (isCalled) {
      return
    }

    isCalled = true

    return fn()
  }
}

export const clearTempBkmOnClose = makeRunOnce(clearTempBkm)

// do not create and delete 
// in 
//  repositionLastBookmarkOnTabActivated
//  repositionLastBookmarkOnCreated
// DO
//  only create, delete later
// BUT
//  if 
//  open dialog for create bookmark (it create bkm1)
//  create bookmark with api (bkm2)
//  try select folder. no windows for select folder dialog will be close. and data will be saved in bkm2
//    IT IS FOR FIRST bkm for url from standard dialog
//
//  FOR SECOND bkm: not added