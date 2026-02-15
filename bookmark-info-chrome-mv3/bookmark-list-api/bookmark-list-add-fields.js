import {
  memo,
} from '../api-mid/index.js'
import {
  getTitleDetails
} from '../folder-api/folder-title-directives.js'
import {
  getDatedTemplate,
  isDatedFolderTitle,
  isVisitedDatedTemplate,
} from '../folder-api/index.js'
import {
  folderCreator,
} from '../folder-creator-api/folderCreator.js';
import { getBookmarkNodeList } from './bookmark-list-nodes.js'

const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map(({ parentId }) => parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = memo.bkmFolderById.get(currentId);

    if (folder) {
      path.push(folder.title);
    }

    currentId = folder?.parentId;
  }

  return path.filter(Boolean).toReversed().concat('').join('/ ')
}

const getColor = (id) => {
   const folder = memo.bkmFolderById.get(id);

  return folder?.color
}

async function getParentFolderList(bookmarkList) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return []
  }

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (memo.bkmFolderById.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => memo.bkmFolderById.get(id))

  const unknownFolderList = await getBookmarkNodeList(unknownParentIdList)

  unknownFolderList.forEach((folder) => {
    const {
      onlyTitle,
      objDirectives,
    } = getTitleDetails(folder.title)

    const folderInfo = {
      title: onlyTitle,
      color: objDirectives['#c'],
      parentId: folder.parentId,
      id: folder.id,
    }
    memo.bkmFolderById.add(folder.id,  folderInfo)
    knownFolderList.push(folderInfo)
  })

  return knownFolderList
}

async function getParentInfoRecursively(bookmarkList) {
  if (bookmarkList.length == 0) {
    return
  }

  const parentFolderList = await getParentFolderList(bookmarkList)
  await getParentInfoRecursively(parentFolderList)
}

// bookmarkList: [{ id, parentId }]
export async function addFieldsToBookmarkList(bookmarkList, addFieldList = []) {

  const addFieldMap = Object.fromEntries(
    addFieldList.map(field => [field, true])
  )

  const isAddFieldPath = addFieldMap['path']

  let resultBookmarkList = bookmarkList.map(bookmark => ({ ...bookmark }))

  const parentNodeList = await getParentFolderList(resultBookmarkList)

  const parentMap = Object.fromEntries(
    parentNodeList.map(
      (folder) => [folder.id, folder]
    )
  )

  resultBookmarkList = resultBookmarkList
    .map((bookmark) => ({
      parentTitle: parentMap[bookmark.parentId]?.title || '',
      color: getColor(bookmark.parentId),
      ...bookmark
    }))

  if (isAddFieldPath) {
    await getParentInfoRecursively(parentNodeList)

    for (const parentId in parentMap) {
      parentMap[parentId].path = parentMap[parentId].parentId && getFullPath(parentMap[parentId].parentId) || ''
    }

    resultBookmarkList = resultBookmarkList
      .map((bookmark) => ({
          path: parentMap[bookmark.parentId]?.path || '',
          ...bookmark
      }))
  }

  resultBookmarkList = resultBookmarkList.map((obj) => (isDatedFolderTitle(obj.parentTitle)
    ? Object.assign({}, obj, {
        templateTitle: getDatedTemplate(obj.parentTitle)
      })
    : obj
  ))

  const templateTitleList = Array.from(
    new Set(
      resultBookmarkList
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

  resultBookmarkList = resultBookmarkList.map((obj) => (obj.templateTitle
    ? Object.assign({}, obj, {
      templateId: templateTitleMap[obj.templateTitle].templateId,
      color: templateTitleMap[obj.templateTitle].templateColor || obj.color,
      isInternal: isVisitedDatedTemplate(obj.templateTitle)
    })
    : obj
  ))

  return resultBookmarkList
}

// addBookmarkParentTitle
//  ?use cache DONE
// addBookmarkFullPath
//  use cache DONE
//  only parent.parentId (do not parent) DONE
// addBookmarkTemplateTitle
//  ?use cache NO
// addBookmarkColor
//  TemplateTitle -> TemplateColor
//  ParentTemplate -> ParentColor
//  color: TemplateColor || ParentColor
//
//  field onlyTitle and title
// ?always get color? in cache
