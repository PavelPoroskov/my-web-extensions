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
  moveBookmarkIgnoreInController,
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
  url,
  title,
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

async function createBookmarkWithParentId({ parentId, url, title }) {
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    const datedFolder = await findOrCreateDatedFolder({ templateTitle: parentTitle, templateId: parentId })
    await createBookmarkWithApi({ parentId: datedFolder.id, url, title })
    await removePreviousDatedBookmarks({ url, template: parentTitle })

    if (!isVisitedDatedTemplate(parentTitle)) {
      await tagList.addTag({ parentId, parentTitle })
    }
  } else {
    await createBookmarkWithApi({ parentId, url, title })
    await tagList.addTag({ parentId, parentTitle })
  }
}

export async function afterUserCreatedBookmarkInGUI({ parentId, id, url, index }) {
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    const datedFolder = await findOrCreateDatedFolder({ templateTitle: parentTitle, templateId: parentId })
    await moveBookmarkIgnoreInController({
      id,
      parentId: datedFolder.id,
      index: 0,
    })

    await removePreviousDatedBookmarks({ url, template: parentTitle })

    if (!isVisitedDatedTemplate(parentTitle)) {
      await tagList.addTag({ parentId, parentTitle })
    }
  } else {
    if (index !== 0) {
      await moveBookmarkIgnoreInController({ id, index: 0 })
    }

    await tagList.addTag({ parentId, parentTitle })
  }
}

export async function createBookmark({ parentId, parentTitle, url, title }) {

  if (parentId) {
    await createBookmarkWithParentId({ parentId, url, title })
  } else if (parentTitle) {
    const folderNode = await findOrCreateFolder(parentTitle)

    await createBookmarkWithParentId({
      parentId: folderNode.id,
      url,
      title,
    })
  } else {
    throw new Error('createBookmark() must use parentId or parentTitle')
  }
}
