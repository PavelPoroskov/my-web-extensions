import {
  getDatedTemplate,
} from '../folder-api/index.js';
import {
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

  async getIdForDatedTemplateTitle(templateTitle) {
    logDT('getIdForDatedTemplateTitle() 00', templateTitle)
    let id = this.cacheTitleToId[templateTitle]
    if (id) {
      return id;
    }

    // TODO wait when create. use Promise.withResolvers. to not crete second 'opened DD-MM-YYYY' on closing window
    const folder = await findOrCreateFolder(templateTitle)
    id = folder.id
    this.cacheTitleToId[templateTitle] = id
    this.mapIdToTitle[id] = id

    return id;
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
      delete this.cacheTitleToId[title]
    }
  }
}

export const datedTemplate = new DatedTemplate()
