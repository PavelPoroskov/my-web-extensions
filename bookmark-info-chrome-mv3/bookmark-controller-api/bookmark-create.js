import {
  tagList,
} from '../api-mid/index.js';
import {
  isDatedFolderTemplate,
  isVisitedDatedTemplate,
} from '../folder-api/index.js';
import {
  findOrCreateDatedFolder,
  findOrCreateFolder,
} from './folder-create.js';
import {
  removePreviousDatedBookmarks,
} from './bookmark-dated.js';
import {
  createBookmarkIgnoreInController,
} from './bookmark-ignore.js'

// import {
//   makeLogFunction,
// } from '../api-low/index.js'

// const logCBK = makeLogFunction({ module: 'bookmark-create.js' })


let lastCreatedBkmParentId
let lastCreatedBkmUrl

export function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

async function createBookmarkWithApi({
  parentId,
  title,
  url,
}) {
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  await createBookmarkIgnoreInController({
    parentId,
    index: 0,
    url,
    title,
  })
}

async function createBookmarkWithParentId({ parentId, title, url }) {
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentName = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentName)

  if (isDatedTemplate) {
    const datedFolder = await findOrCreateDatedFolder({ templateTitle: parentName, templateId: parentId })
    await createBookmarkWithApi({ parentId: datedFolder.id, url, title })
    await removePreviousDatedBookmarks({ url, template: parentName })

    if (!isVisitedDatedTemplate(parentName)) {
      await tagList.addRecentTagFromFolder({ id: parentId, title: parentName })
    }
  } else {
    await createBookmarkWithApi({ parentId, url, title })
    await tagList.addRecentTagFromFolder({ id: parentId, title: parentName })
  }
}

async function createBookmarkWithParentName({ parentName, url, title }) {
  const folderNode = await findOrCreateFolder(parentName)

  await createBookmarkWithParentId({
    parentId: folderNode.id,
    title,
    url,
  })
}

export async function createBookmark({ parentId, parentName, title, url }) {

  if (parentId) {
    await createBookmarkWithParentId({ parentId, title, url })
  } else if (parentName) {
    await createBookmarkWithParentName({ parentName, title, url })
  } else {
    throw new Error('createBookmark() must use parentId or parentName')
  }
}
