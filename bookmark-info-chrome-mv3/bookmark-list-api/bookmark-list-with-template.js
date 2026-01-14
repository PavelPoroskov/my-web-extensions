import {
  getDatedTemplate,
  isDatedFolderTitle,
  isVisitedDatedTemplate,
} from '../folder-api/index.js'
import {
  folderCreator,
} from '../bookmark-controller-api/folderCreator.js';
import {
  getBookmarkList,
} from './bookmark-list.js'
import {
  addBookmarkPathInfo,
} from './bookmark-list-with-path.js'

async function addBookmarkTemplateInfo(bookmarkList) {
  let resultList = bookmarkList.map((obj) => (isDatedFolderTitle(obj.parentTitle)
    ? Object.assign({}, obj, { templateTitle: getDatedTemplate(obj.parentTitle) })
    : obj
  ))

  const templateTitleList = Array.from(
    new Set(
      resultList
        .map(({ templateTitle }) => templateTitle)
        .filter(Boolean)
    )
  )

  const templateInfoList = await Promise.all(templateTitleList.map(
    (templateTitle) => folderCreator.createFolder(templateTitle)
      .then(({ id: templateId, color: templateColor }) => ({ templateId, templateTitle, templateColor }))
  ))

  const templateTitleMap = Object.fromEntries(
    templateInfoList.map(({ templateId, templateTitle, templateColor }) => [templateTitle, { templateId, templateColor }])
  )

  resultList = resultList.map((obj) => (obj.templateTitle
    ? Object.assign({}, obj, {
      templateId: templateTitleMap[obj.templateTitle].templateId,
      templateColor: templateTitleMap[obj.templateTitle].templateColor,
      isInternal: isVisitedDatedTemplate(obj.templateTitle)
    })
    : obj
  ))

  return resultList
}

export async function getBookmarkListWithTemplate(url) {
  const bookmarkList = await getBookmarkList(url)
  // add { parentTitle, path }
  const listWithPath = await addBookmarkPathInfo(bookmarkList)
  // add { templateId, templateTitle }
  const listWithTemplate = await addBookmarkTemplateInfo(listWithPath)

  const selectedBookmarkList = listWithTemplate
    .map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title,
        parentId: bookmark.parentId,
        parentTitle: bookmark.parentTitle,
        parentColor: bookmark.templateColor || bookmark.parentColor,
        path: bookmark.path,
        templateId: bookmark.templateId,
        templateTitle: bookmark.templateTitle,
        isInternal: bookmark.isInternal,
      }));

  return selectedBookmarkList
}
