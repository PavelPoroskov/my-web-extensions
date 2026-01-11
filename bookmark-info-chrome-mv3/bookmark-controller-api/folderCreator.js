import {
  getDatedTitle,
  DATED_ROOT_NEW,
  DATED_ROOT_OLD,
  UNCLASSIFIED_TITLE,
} from '../folder-api/index.js';
import {
  _findOrCreateDatedFolder,
  _findOrCreateFolder,
  _findFolder,
} from './folder-create.js';
import {
  makeLogFunction,
} from '../api-low/index.js'

const logDT = makeLogFunction({ module: 'folderCreator.js' })

class FolderCreator {
  mapTitleToInfo = {}
  mapIdToTitle = {}
  mapPromise = {}

  clearCache(folderId) {
    const title = this.mapIdToTitle[folderId]

    if (title) {
      delete this.mapIdToTitle[folderId]
      delete this.mapPromise[title]
      delete this.mapTitleToInfo[title]
    }
  }

  async _useCacheForCreate({ getKey, getValue, options }) {
    const title = getKey(options)
    logDT('_useCacheForCreate() 00 title', title)

    let oInfo = this.mapTitleToInfo[title]
    if (oInfo) {
      delete this.mapPromise[title]
      return oInfo;
    }

    const promise = this.mapPromise[title]

    if (!promise) {
      this.mapPromise[title] = getValue(options)
      oInfo = await this.mapPromise[title]
    } else {
      oInfo = await promise
    }

    this.mapTitleToInfo[title] = {
      id: oInfo.id,
      ...(Object.keys(oInfo.objDirectives || {}).length > 0
        ? { objDirectives: oInfo.objDirectives }
        : undefined
      )
    }
    this.mapIdToTitle[oInfo.id] = title

    return oInfo;
  }
  async findOrCreateFolder(templateTitle) {
    logDT('findOrCreateFolder() 00', templateTitle)

    const result = await this._useCacheForCreate({
      getKey: (options) => options,
      getValue: _findOrCreateFolder,
      options: templateTitle,
    })

    // logDT('   findOrCreateFolder() 99', templateTitle, id)
    return {
      id: result.id,
      color: result.objDirectives?.['c']
    }
  }
  async findOrCreateDatedFolderId({ templateTitle, templateId }) {
    // logDT('findOrCreateDatedFolderId() 00', `"${templateTitle}"`, templateId)

    const parentId = await this.findOrCreateDatedRootNew()
    // logDT('findOrCreateDatedFolderId() 11 parentId', parentId)

    const result = await this._useCacheForCreate({
      getKey: (options) => getDatedTitle(options.templateTitle),
      getValue: (options) => _findOrCreateDatedFolder({ ...options, parentId }),
      options: { templateTitle, templateId },
    })

    // logDT('findOrCreateDatedFolderId() 99', `"${templateTitle}"`, id)
    return result.id
  }

  async _useCacheForFind({ getKey, getValue, options }) {
    const title = getKey(options)
    logDT('_useCacheForFind() 00 title', title)

    let oInfo = this.mapTitleToInfo[title]
    if (oInfo || oInfo === null) {
      delete this.mapPromise[title]
      return oInfo;
    }

    const promise = this.mapPromise[title]

    if (!promise) {
      this.mapPromise[title] = getValue(options)
      oInfo = await this.mapPromise[title]
    } else {
      oInfo = await promise
    }

    this.mapTitleToInfo[title] = oInfo || null

    if (oInfo) {
      this.mapIdToTitle[oInfo.id] = title
    }

    return oInfo
  }
  async _findFolder(title) {
    logDT('findFolder() 00', title)

    const result = await this._useCacheForFind({
      getKey: (options) => options,
      getValue: _findFolder,
      options: title,
    })

    return result
  }

  async findOrCreateDatedRootNew() {
    const { id } = await this.findOrCreateFolder(DATED_ROOT_NEW)
    return id
  }
  async findDatedRootNew() {
    const { id } = await this._findFolder(DATED_ROOT_NEW)
    return id
  }

  async findOrCreateDatedRootOld() {
    const { id }= await this.findOrCreateFolder(DATED_ROOT_OLD)
    return id
  }
  async findDatedRootOld() {
    const { id } = await this._findFolder(DATED_ROOT_OLD)
    return id
  }

  async findOrCreateUnclassified() {
    const { id } = await this.findOrCreateFolder(UNCLASSIFIED_TITLE)
    return id
  }
  async findUnclassified() {
    const { id } = await this._findFolder(UNCLASSIFIED_TITLE)
    return id
  }
}

export const folderCreator = new FolderCreator()
