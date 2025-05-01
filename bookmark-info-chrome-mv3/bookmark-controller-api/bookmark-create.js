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

export async function afterUserCreatedBookmarkInGUI({ node, isSingle }) {
  const { parentId, id, url } = node
  const [parentNode] = await chrome.bookmarks.get(parentId)
  const parentName = parentNode.title

  const isDatedTemplate = isDatedFolderTemplate(parentName)

  if (isDatedTemplate) {
    const datedFolder = await findOrCreateDatedFolder({ templateTitle: parentName, templateId: parentId })
    await moveBookmarkIgnoreInController({
      id,
      parentId: datedFolder.id,
      index: isSingle? 0 : undefined,
    })

    await removePreviousDatedBookmarks({ url, template: parentName })

    if (!isVisitedDatedTemplate(parentName)) {
      await tagList.addRecentTagFromFolder({ id: parentId, title: parentName })
    }
  } else {
    if (node.index !== 0 && isSingle) {
      await moveBookmarkIgnoreInController({ id, index: 0 })
    }

    await tagList.addRecentTagFromFolder({ id: parentId, title: parentName })
  }
}

export async function createBookmark({ parentId, parentName, url, title }) {

  if (parentId) {
    await createBookmarkWithParentId({ parentId, url, title })
  } else if (parentName) {
    const folderNode = await findOrCreateFolder(parentName)

    await createBookmarkWithParentId({
      parentId: folderNode.id,
      url,
      title,
    })
  } else {
    throw new Error('createBookmark() must use parentId or parentName')
  }
}
