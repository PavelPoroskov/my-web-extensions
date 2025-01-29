import {
  isDatedFolderTemplate,
} from '../folder-api/index.js';
import {
  createBookmarkInCommonFolder,
} from './bookmark-create1.js';
import {
  createBookmarkInDatedTemplate,
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

export async function createBookmarkFolderByName({ url, title, folderName }) {
  const folder = await findOrCreateFolder(folderName)
  const result = await createBookmarkFolderById({
    parentId: folder.id,
    title,
    url,
  })

  return result
}
