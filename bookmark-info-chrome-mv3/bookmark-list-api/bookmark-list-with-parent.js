import {
  getBookmarkList,
  getBookmarkNodeList,
} from './bookmark-list.js'
import {
  getDatedTemplate,
  getTitleDetails,
  isDatedFolderTitle,
} from '../folder-api/folder-title-directives.js'
import {
  folderCreator,
} from '../folder-creator-api/folderCreator.js';

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

export async function addBookmarkColorInfo(bookmarkList) {
  const bkmListWithTemplate = bookmarkList.map((obj) => {
    const {
      onlyTitle,
      objDirectives,
    } = getTitleDetails(obj.parentTitle)

    return {
      ...obj,
      parentTitle: onlyTitle,
      parentColor: objDirectives['#c'],
      templateTitle: isDatedFolderTitle(obj.parentTitle) ? getDatedTemplate(obj.parentTitle) : undefined,
    }
  })

  const templateTitleList = Array.from(
    new Set(
      bkmListWithTemplate
        .map(({ templateTitle }) => templateTitle)
        .filter(Boolean)
    )
  )

  const templateInfoList = await Promise.all(templateTitleList.map(
    (templateTitle) => folderCreator.createFolder(templateTitle)
      .then(({ color }) => ({ templateTitle, color }))
  ))

  const templateTitleMap = Object.fromEntries(
    templateInfoList.map(({ templateTitle, color }) => [templateTitle, color])
  )

  const resultList = bkmListWithTemplate
    .map((bookmark) => ({
      ...bookmark,
      templateColor: bookmark.templateTitle ? templateTitleMap[bookmark.templateTitle] : undefined,
    }))

  return resultList
}

export async function getBookmarkListWithParent(url) {
  const bookmarkList = await getBookmarkList(url)
  // add { parentTitle }
  const listWithParent = await addBookmarkParentInfo(bookmarkList)

  return listWithParent
}
