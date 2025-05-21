import {
  getDatedTitle,
} from '../folder-api/index.js';
import {
  _findOrCreateDatedFolder,
  _findOrCreateFolder,
  _findFolder,
} from './folder-create.js';

import {
  makeLogFunction,
} from '../api-low/index.js'

const logDT = makeLogFunction({ module: 'datedTemplate.js' })

const DATED_ROOT_NEW = '@D new'
const DATED_ROOT_OLD = '@D old'
const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

class DatedTemplate {
  // title to id
  cacheTitleToId = {}
  mapIdToTitle = {}
  mapPromise = {}

  clearCache(folderId) {
    const title = this.mapIdToTitle[folderId]

    if (title) {
      delete this.mapIdToTitle[folderId]
      delete this.mapPromise[title]
      delete this.cacheTitleToId[title]
    }
  }

  async _useCacheForCreate({ getKey, getValue, options }) {
    const key = getKey(options)
    logDT('_useCacheForCreate() 00 key', key)

    let id = this.cacheTitleToId[key]
    if (id) {
      delete this.mapPromise[key]
      return id;
    }

    const promise = this.mapPromise[key]

    if (!promise) {
      this.mapPromise[key] = getValue(options)
      id = await this.mapPromise[key]
    } else {
      id = await promise
    }

    this.cacheTitleToId[key] = id
    this.mapIdToTitle[id] = key

    return id
  }
  async findOrCreateFolder(templateTitle) {
    logDT('findOrCreateFolder() 00', templateTitle)

    const id = await this._useCacheForCreate({
      getKey: (options) => options,
      getValue: _findOrCreateFolder,
      options: templateTitle,
    })

    return id
  }
  async findOrCreateDatedFolderId({ templateTitle, templateId }) {
    logDT('findOrCreateDatedFolderWithCache() 00', templateTitle, templateId)

    const parentId = await this.findOrCreateDatedRootNew()

    const id = await this._useCacheForCreate({
      getKey: (options) => getDatedTitle(options.templateTitle),
      getValue: (options) => _findOrCreateDatedFolder({ ...options, parentId }),
      options: { templateTitle, templateId },
    })

    return id
  }

  async _useCacheForFind({ getKey, getValue, options }) {
    const key = getKey(options)
    logDT('_useCacheForFind() 00 key', key)

    let id = this.cacheTitleToId[key]
    if (id || id === null) {
      delete this.mapPromise[key]
      return id;
    }

    const promise = this.mapPromise[key]

    if (!promise) {
      this.mapPromise[key] = getValue(options)
      id = await this.mapPromise[key]
    } else {
      id = await promise
    }

    this.cacheTitleToId[key] = id || null

    if (id) {
      this.mapIdToTitle[id] = key
    }

    return id
  }
  async _findFolder(title) {
    logDT('findFolder() 00', title)

    const id = await this._useCacheForFind({
      getKey: (options) => options,
      getValue: _findFolder,
      options: title,
    })

    return id
  }

  async findOrCreateDatedRootNew() {
    const id = await this.findOrCreateFolder(DATED_ROOT_NEW)
    return id
  }
  async findDatedRootNew() {
    const id = await this._findFolder(DATED_ROOT_NEW)
    return id
  }

  async findOrCreateDatedRootOld() {
    const id = await this.findOrCreateFolder(DATED_ROOT_OLD)
    return id
  }
  async findDatedRootOld() {
    const id = await this._findFolder(DATED_ROOT_OLD)
    return id
  }

  async findOrCreateUnclassified() {
    const id = await this.findOrCreateFolder(UNCLASSIFIED_TITLE)
    return id
  }
  async findUnclassified() {
    const id = await this._findFolder(UNCLASSIFIED_TITLE)
    return id
  }
}

export const datedTemplate = new DatedTemplate()
