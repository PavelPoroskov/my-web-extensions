import {
  getDatedTemplate,
  getDatedTitle,
} from '../folder-api/index.js';
import {
  findOrCreateDatedFolder,
  findOrCreateFolder,
} from '../bookmark-controller-api/folder-create.js';

import {
  makeLogFunction,
} from '../api-low/index.js'

const logDT = makeLogFunction({ module: 'datedTemplate.js' })

class DatedTemplate {
  // title to id
  cacheTitleToId = {}
  mapIdToTitle = {}
  mapPromise = {}

  async _useCache({ getKey, getValue, options }) {
    const key = getKey(options)

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
    id = folder.id

    this.cacheTitleToId[key] = id
    this.mapIdToTitle[id] = key

    return id
  }
  async getIdForDatedTemplateTitle(templateTitle) {
    logDT('getIdForDatedTemplateTitle() 00', templateTitle)

    const id = await this._useCache({
      getKey: (options) => options,
      getValue: findOrCreateFolder,
      options: templateTitle,
    })

    return id
  }
  async getIdForNewDated({ templateTitle, templateId }) {

    const id = await this._useCache({
      getKey: (options) => getDatedTitle(options.templateTitle),
      getValue: findOrCreateDatedFolder,
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
