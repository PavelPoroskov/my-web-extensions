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
  BOOKMARKS_BAR_FOLDER_TITLE,
  OTHER_BOOKMARKS_FOLDER_TITLE,
  DATED_ROOT_NEW_FOLDER_TITLE,
  DATED_ROOT_OLD_FOLDER_TITLE,
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
  getExistingFolderPlaceParentTitleList,
  getNewFolderPlaceParentTitle,
} from './folder-place.js';
import {
  findFolderMultiWay,
} from './find-folder.js';


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

  async _parentTitleToParentId(parentTitle) {
    let parentId

    switch (parentTitle) {
      case OTHER_BOOKMARKS_FOLDER_TITLE:
        parentId = rootFolders.OTHER_BOOKMARKS_FOLDER_ID
        break
      case BOOKMARKS_BAR_FOLDER_TITLE:
        parentId = rootFolders.BOOKMARKS_BAR_FOLDER_ID
        break
      default: {
        const parentFolder = await this.findFolder({ title: parentTitle, isCreate: true })
        parentId = parentFolder.id
      }
    }

    return parentId
  }
  async getNewFolderPlaceParentId(title) {
    const parentTitle = getNewFolderPlaceParentTitle(title)
    const parentId = await this._parentTitleToParentId(parentTitle)

    return parentId
  }
  async getExistingFolderPlaceParentIdList(title) {
    const parentTitleList = getExistingFolderPlaceParentTitleList(title)

    const parentIdList = await Promise.all(
      parentTitleList.map(
        parentTitle => this._parentTitleToParentId(parentTitle)
      )
    )

    return parentIdList
  }

  async moveFolderAfterRename({ id, parentId, title, index }) {
    const moveArgs = {}
    const settings = await extensionSettings.get()

    if (settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
      const correctParentIdList = await this.getExistingFolderPlaceParentIdList(title)

      if (!correctParentIdList.includes(parentId)) {
        moveArgs.parentId = correctParentIdList[0]
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
      moveFolderIgnoreInController({
        id,
        ...moveArgs,
      })
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
  async createFolderInBookmarks(title) {
    const parentId = await this.getNewFolderPlaceParentId(title)
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

    const {
      objDirectives
    } = getTitleDetails(title)

    return {
      id: folder.id,
      ...(Object.keys(objDirectives || {}).length > 0
        ? { objDirectives: objDirectives }
        : undefined
      )
    }
  }
  async _findFolder({ title, isCreate=false }) {
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
    return this._findFolder({ title, isCreate: false })
  }
  async createFolder(title) {
    const result = await this._findFolder({ title, isCreate: true })

    return {
      ...result,
      color: result.objDirectives?.['c']
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
