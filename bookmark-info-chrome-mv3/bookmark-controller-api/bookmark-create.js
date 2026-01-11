import {
  tagList,
} from '../api-mid/index.js';
import {
  urlEvents,
} from '../api/urlEvents.js'
import {
  isDatedFolderTemplate,
  isVisitedDatedTemplate,
} from '../folder-api/index.js';
import {
  folderCreator,
} from './folderCreator.js';
import {
  removePreviousDatedBookmarks,
} from './bookmark-dated.js';
import {
  createBookmarkIgnoreInController,
  moveBookmarkIgnoreInController,
  removeBookmark,
} from './bookmark-ignore.js'
import {
  makeLogFunction,
} from '../api-low/index.js'

const logCBK = makeLogFunction({ module: 'bookmark-create.js' })


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
  // logCBK('createBookmarkWithApi() 00', parentId, url)
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  const bookmarkList = await chrome.bookmarks.search({ url })
  const deleteList = bookmarkList.filter((bkm) => bkm.parentId == parentId)

  await createBookmarkIgnoreInController({
    parentId,
    index: 0,
    url,
    title,
  })

  await deleteList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => removeBookmark(bkm.id)
    ),
    Promise.resolve(),
  );
}

async function createBookmarkWithParentId({ parentId, url, title, parentTitle: inParentTitle }) {
  // optional params
  let parentTitle = inParentTitle

  if (!parentTitle) {
    const [parentNode] = await chrome.bookmarks.get(parentId)
    parentTitle = parentNode.title
  }
  // logCBK('createBookmarkWithParentId() 00', parentId, `"${parentTitle}"`, url)

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    const datedFolderId = await folderCreator.findOrCreateDatedFolderId({ templateTitle: parentTitle, templateId: parentId })
    // logCBK('createBookmarkWithParentId() 22 datedFolderId', datedFolderId)
    await createBookmarkWithApi({ parentId: datedFolderId, url, title })
    await removePreviousDatedBookmarks({ url, template: parentTitle })

    if (!isVisitedDatedTemplate(parentTitle)) {
      await tagList.addTag({ parentId, parentTitle })
    }
  } else {
    await createBookmarkWithApi({ parentId, url, title })
    await tagList.addTag({ parentId, parentTitle })
  }

  urlEvents.onCreateBookmark({ url, parentTitle })
}

export async function afterUserCreatedBookmarkInGUI({ parentId, id, url, index }) {
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentTitle = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentTitle)

  if (isDatedTemplate) {
    const datedFolderId = await folderCreator.findOrCreateDatedFolderId({ templateTitle: parentTitle, templateId: parentId })
    await moveBookmarkIgnoreInController({
      id,
      parentId: datedFolderId,
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

  urlEvents.onCreateBookmark({ url, parentTitle })
}

export async function createBookmark({ parentId, parentTitle, url, title }) {

  if (parentId) {
    await createBookmarkWithParentId({ parentId, url, title })
  } else if (parentTitle) {
    logCBK('createBookmark 22 parentTitle', parentTitle)
    const { id: parentId } = await folderCreator.findOrCreateFolder(parentTitle)
    logCBK('createBookmark 22 parentId', parentId)

    await createBookmarkWithParentId({
      parentId,
      url,
      title,
      parentTitle,
    })
  } else {
    throw new Error('createBookmark() must use parentId or parentTitle')
  }
}
