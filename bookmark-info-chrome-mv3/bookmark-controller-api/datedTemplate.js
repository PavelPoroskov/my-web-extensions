import {
  getDatedTemplate,
  getDatedTitle,
} from '../folder-api/index.js';
import {
  findOrCreateDatedFolder,
  findOrCreateFolder,
} from './folder-create.js';

import {
  makeLogFunction,
} from '../api-low/index.js'

const logDT = makeLogFunction({ module: 'datedTemplate.js' })

const DATED_ROOT_NEW = '@D new'
const DATED_ROOT_OLD = '@D old'

export function compareDatedTitle(a,b) {
  const partsA = a.split('.')
  const orderA = partsA.at(-1)
  const restA = partsA.slice(0, -1).join('.')

  const partsB = b.split('.')
  const orderB = partsB.at(-1)
  const restB = partsB.slice(0, -1).join('.')

  return (orderA || '').localeCompare(orderB || '') || (restA || '').localeCompare(restB || '')
}

class DatedTemplate {
  // title to id
  cacheTitleToId = {}
  mapIdToTitle = {}
  mapPromise = {}

  async _useCache({ getKey, getValue, options }) {
    const key = getKey(options)
    logDT('_useCache() 00 key', key)

    let id = this.cacheTitleToId[key]
    if (id) {
      delete this.mapPromise[key]
      return id;
    }

    let folder
    const promise = this.mapPromise[key]

    if (!promise) {
      this.mapPromise[key] = getValue(options)
      folder = await this.mapPromise[key]
    } else {
      folder = await promise
    }
    logDT('_useCache() 33 folder', folder)
    id = folder.id

    this.cacheTitleToId[key] = id
    this.mapIdToTitle[id] = key

    return id
  }
  async getIdForDatedTemplateTitle(templateTitle) {
  // async getIdForTitle(templateTitle) {
    logDT('getIdForDatedTemplateTitle() 00', templateTitle)

    const id = await this._useCache({
      getKey: (options) => options,
      getValue: findOrCreateFolder,
      options: templateTitle,
    })

    return id
  }
  async getIdDatedRootNew() {
    const id = await this.getIdForDatedTemplateTitle(DATED_ROOT_NEW)
    return id
  }
  async getIdDatedRootOld() {
    const id = await this.getIdForDatedTemplateTitle(DATED_ROOT_OLD)
    return id
  }
  async findOrCreateDatedFolderId({ templateTitle, templateId }) {
    logDT('findOrCreateDatedFolderWithCache() 00', templateTitle, templateId)

    const rootId = await this.getIdDatedRootNew()

    const id = await this._useCache({
      getKey: (options) => getDatedTitle(options.templateTitle),
      getValue: (options) => findOrCreateDatedFolder({ ...options, rootId }),
      options: { templateTitle, templateId },
    })

    return id
  }
  async getParentIdForDatedTitle(title) {
    logDT('getParentIdForDatedTitle() 00', title)

    const templateTitle = getDatedTemplate(title)
    logDT('getParentIdForDatedTitle() 11', templateTitle)

    const id = await this.getIdForDatedTemplateTitle(templateTitle);
    logDT('getParentIdForDatedTitle() 22', id)

    return id;
  }
  clearCache(folderId) {
    const title = this.mapIdToTitle[folderId]

    if (title) {
      delete this.mapIdToTitle[folderId]
      delete this.mapPromise[title]
      delete this.cacheTitleToId[title]
    }
  }
}

export const datedTemplate = new DatedTemplate()
