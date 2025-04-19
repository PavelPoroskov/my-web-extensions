import {
  isDatedFolderTemplate,
  DATED_TEMPLATE_OPENED,
  DATED_TEMPLATE_VISITED,
} from '../folder-api/index.js';
import {
  createBookmarkInCommonFolder,
} from './bookmark-create1.js';
import {
  createBookmarkInDatedTemplate,
  removeDatedBookmarksForTemplate,
} from './bookmark-dated.js';
import {
  findOrCreateFolder,
} from './folder-create.js';

export async function createBookmarkFolderById({ parentId, title, url }) {
  const [folderNode] = await chrome.bookmarks.get(parentId)
  const isDatedTemplate = isDatedFolderTemplate(folderNode.title)

  let result
  if (isDatedTemplate) {
    result = await createBookmarkInDatedTemplate({
      parentId,
      parentTitle: folderNode.title,
      title,
      url,
    })
  } else {
    result = await createBookmarkInCommonFolder({ parentId, title, url })
  }

  return result
}

export async function createBookmarkFolderByName({ url, title, folderNameList }) {
  const createFolderListResult = await Promise.allSettled(folderNameList.map(
    (folderName) => findOrCreateFolder(folderName)
  ))
  const folderNodeList = createFolderListResult.map((result) => result.value).filter(Boolean)

  await Promise.allSettled(folderNodeList.map(
    (folder) => createBookmarkFolderById({
      parentId: folder.id,
      title,
      url,
    })
  ))
}

export async function createBookmarkVisited({ url, title }) {
  await createBookmarkFolderByName({ url, title, folderNameList: [DATED_TEMPLATE_VISITED] })

  // visited replaces opened
  await removeDatedBookmarksForTemplate({ url, template: DATED_TEMPLATE_OPENED })
}

export async function createBookmarkOpened({ url, title }) {
  await createBookmarkFolderByName({ url, title, folderNameList: [DATED_TEMPLATE_OPENED] })
}
