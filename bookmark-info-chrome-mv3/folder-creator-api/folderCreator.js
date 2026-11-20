import {
  USER_OPTION,
} from '../constant/index.js'
import {
  extensionSettings,
} from '../api-mid/index.js'
import {
  createFolderIgnoreInController,
  moveFolderIgnoreInController,
  updateFolder,
} from '../bookmark-controller-api/folder-ignore.js';
import {
  OTHER_BOOKMARKS_FOLDER_TITLE,
  DATED_ROOT_NEW_FOLDER_TITLE,
  DATED_ROOT_OLD_FOLDER_TITLE,
  DATED_ROOT_SERVICE_FOLDER_TITLE,
  UNCLASSIFIED_TITLE,

  getTitleDetails,
  isDatedFolderTitle,
  makeCompareDatedTitleWithFixed,
  mergeFolderTitle,
} from '../folder-api/index.js';
import {
  rootFolders,
} from './root-folders.js';
import {
  getFolderInfo,
} from './folder-place.js';
import {
  findFolderMultiWay,
} from './find-folder.js';

export async function findChildFolderWithExactTitle({ title, parentId }) {
  const nodeList = await chrome.bookmarks.search({ title });
  const foundItem = nodeList.find((node) => !node.url && node.parentId == parentId)

  return foundItem
}

class FolderCreator {
  mapTitleToInfo = {}
  mapIdToTitle = {}

  clearCache(folderId) {
    const title = this.mapIdToTitle[folderId]

    if (title) {
      delete this.mapIdToTitle[folderId]
      delete this.mapTitleToInfo[title]
    }
  }

  async _folderTitleToFolderId(folderTitle) {
    let parentId

    switch (folderTitle) {
      case OTHER_BOOKMARKS_FOLDER_TITLE:
        parentId = rootFolders.OTHER_BOOKMARKS_FOLDER_ID
        break
      // case BOOKMARKS_BAR_FOLDER_TITLE:
      //   parentId = rootFolders.BOOKMARKS_BAR_FOLDER_ID
      //   break
      default: {
        const parentFolder = await this._provideFolder({ title: folderTitle, isCreate: true })
        parentId = parentFolder.id
      }
    }

    return parentId
  }

  async getFolderInfoWithParentId(title) {
    const folderInfo = getFolderInfo(title)
    const parentId = await this._folderTitleToFolderId(folderInfo.parentTitle)

    return {
      ...folderInfo,
      parentId,
    }
  }

  async provideFolderInBar(title) {
    const onlyTitle = getTitleDetails(title).onlyTitle
    let folder

    folder = await findChildFolderWithExactTitle({ title: onlyTitle, parentId: rootFolders.BOOKMARKS_BAR_FOLDER_ID })

    if (!folder) {
      folder = await this.createFolderInParent({
        title: onlyTitle,
        parentId: rootFolders.BOOKMARKS_BAR_FOLDER_ID
      })
    }

    return folder
  }
  async moveFolderAfterRename({ id, parentId, title, index }) {
    const moveArgs = {}
    const settings = await extensionSettings.get()
    const folderInfo = await this.getFolderInfoWithParentId(title)

    if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
      if (parentId !== folderInfo.parentId) {
        moveArgs.parentId = folderInfo.parentId
      }
    }

    const finalParentId = moveArgs.parentId || parentId

    if (finalParentId in rootFolders.IdMap) {
      const firstLevelNodeList = await chrome.bookmarks.getChildren(finalParentId)
      const findIndex = firstLevelNodeList.find((item) => title.localeCompare(item.title) < 0)

      if (index != findIndex) {
        moveArgs.index = findIndex.index
      }
    }

    if (0 < Object.keys(moveArgs).length) {
      await moveFolderIgnoreInController({
        id,
        ...moveArgs,
      })

      if (folderInfo.folderType === 'top folder') {
        await this.provideFolderInBar(title)
      }
    }
  }
  async mergeFolderTitleToNode({ folder, newTitle }) {
    const mergedTitle = mergeFolderTitle({ oldTitle: folder.title, newTitle })

    if (mergedTitle) {
      await updateFolder({ id: folder.id, title: mergedTitle })
      await this.moveFolderAfterRename({
        id: folder.id,
        title: mergedTitle,
        parentId: folder.parentId,
        index: folder.index,
      })

      return mergedTitle
    }

    return folder.title
  }

  async findFolderInBookmarks(title) {
    const folder = await findFolderMultiWay(title)

    if (folder) {
      const mergedTitle = await this.mergeFolderTitleToNode({
        folder,
        newTitle: title,
      })

      const {
        objDirectives
      } = getTitleDetails(mergedTitle)

      return {
        id: folder.id,
        ...(Object.keys(objDirectives || {}).length > 0
          ? { objDirectives: objDirectives }
          : undefined
        )
      }
    }
  }
  async createFolderInParent({ title, parentId }) {
    const firstLevelNodeList = await chrome.bookmarks.getChildren(parentId)

    let findIndex

    if (isDatedFolderTitle(title)) {
      const compareDatedTitleWithFixed = makeCompareDatedTitleWithFixed(title)
      findIndex = firstLevelNodeList.find((node) => !node.url && compareDatedTitleWithFixed(node.title) < 0)
    } else {
      findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    }

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    const folder = await createFolderIgnoreInController(folderParams)

    return folder
  }
  async createFolderInBookmarks(title) {
    const folderInfo = await this.getFolderInfoWithParentId(title)
    let folder = await this.createFolderInParent(folderInfo)

    const {
      objDirectives,
    } = getTitleDetails(title)

    if (folderInfo.folderType === 'top folder') {

      folder = await this.provideFolderInBar(title)
    }

    return {
      id: folder.id,
      ...(Object.keys(objDirectives || {}).length > 0
        ? { objDirectives: objDirectives }
        : undefined
      )
    }
  }
  async _provideFolder({ title, isCreate=false }) {
    let result

    if (this.mapTitleToInfo[title] === undefined) {
      this.mapTitleToInfo[title] = {}
    }

    // 1. get from cache
    result = this.mapTitleToInfo[title]?.data
    if (result) {
      delete this.mapTitleToInfo[title]['findPromise']
      delete this.mapTitleToInfo[title]['createPromise']
      return result
    } else if (result === null && isCreate === false) {
      delete this.mapTitleToInfo[title]['findPromise']
      return null
    }

    const findPromise = this.mapTitleToInfo[title]?.findPromise
    if (!findPromise) {
      this.mapTitleToInfo[title].findPromise = this.findFolderInBookmarks(title)
      result = await this.mapTitleToInfo[title].findPromise
    } else {
      result = await findPromise
    }

    result = result || null


    if (isCreate === false) {

      this.mapTitleToInfo[title].data = result

      if (result) {
        this.mapIdToTitle[result.id] = title
      }

      return result

    } else { // isCreate===true

      if (result) {
        this.mapTitleToInfo[title].data = result
        this.mapIdToTitle[result.id] = title
        return result
      }

      const createPromise = this.mapTitleToInfo[title]?.createPromise
      if (!createPromise) {
        this.mapTitleToInfo[title].createPromise = this.createFolderInBookmarks(title)
        result = await this.mapTitleToInfo[title].createPromise
      } else {
        result = await createPromise
      }

      this.mapTitleToInfo[title].data = result
      this.mapIdToTitle[result.id] = title
      return result
    }
  }

  async findFolder(title) {
    return this._provideFolder({ title, isCreate: false })
  }
  async createFolder(title) {
    const result = await this._provideFolder({ title, isCreate: true })

    return {
      ...result,
      color: result.objDirectives?.['#c'],
      icon: result.objDirectives?.['#i'],
    }
  }

  async findOrCreateDatedRootNew() {
    const result = await this.createFolder(DATED_ROOT_NEW_FOLDER_TITLE)
    return result.id
  }
  async findDatedRootNew() {
    const result = await this.findFolder(DATED_ROOT_NEW_FOLDER_TITLE)
    return result?.id
  }

  async findOrCreateDatedRootOld() {
    const result = await this.createFolder(DATED_ROOT_OLD_FOLDER_TITLE)
    return result.id
  }
  async findDatedRootOld() {
    const result = await this.findFolder(DATED_ROOT_OLD_FOLDER_TITLE)
    return result?.id
  }

  async findOrCreateDatedRootService() {
    const result = await this.createFolder(DATED_ROOT_SERVICE_FOLDER_TITLE)
    return result.id
  }
  async findDatedRootService() {
    const result = await this.findFolder(DATED_ROOT_SERVICE_FOLDER_TITLE)
    return result?.id
  }

  async findOrCreateUnclassified() {
    const result = await this.createFolder(UNCLASSIFIED_TITLE)
    return result.id
  }
  async findUnclassified() {
    const result = await this.findFolder(UNCLASSIFIED_TITLE)
    return result?.id
  }
}

export const folderCreator = new FolderCreator()
