import {
  getBookmarkList,
  getBookmarkNodeList,
} from './bookmark-list.js'

export async function addBookmarkParentInfo(bookmarkList) {

  const parentIdList = bookmarkList.map(({ parentId }) => parentId).filter(Boolean)
  const uniqueParentIdList = Array.from(new Set(parentIdList))
  const parentFolderList = await getBookmarkNodeList(uniqueParentIdList)

  const parentMap = Object.fromEntries(
    parentFolderList
      .map(({ id, title }) => [id, title])
  )

  const resultList = bookmarkList
    .map((bookmark) => ({
      parentTitle: parentMap[bookmark.parentId] || '',
      ...bookmark
    }))

  return resultList
}

export async function getBookmarkListWithParent(url) {
  const bookmarkList = await getBookmarkList(url)
  const listWithParent = await addBookmarkParentInfo(bookmarkList)

  return listWithParent
}
