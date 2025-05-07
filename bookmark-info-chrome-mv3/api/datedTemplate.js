import {
  getDatedTemplate,
} from '../folder-api/index.js';
import {
  findOrCreateFolder,
} from '../bookmark-controller-api/folder-create.js';

// import {
//   makeLogFunction,
// } from '../api-low/index.js'

// const logDT = makeLogFunction({ module: 'datedTemplate.js' })

class DatedTemplate {
  cacheForDatedTemplate = {}

  async getTagIdForTemplate(templateTitle) {

    let id = this.cacheForDatedTemplate[templateTitle]
    if (id) {
      return id;
    }

    // TODO wait when create. use Promise.withResolvers. to not crete second 'opened DD-MM-YYYY' on closing window
    const folder = await findOrCreateFolder(templateTitle)
    id = folder.id
    this.cacheForDatedTemplate[templateTitle] = id

    return id;
  }
  async getTagIdForDated(title) {

    const templateTitle = getDatedTemplate(title)
    return await this.getIdForTemplate(templateTitle);
  }
}

export const datedTemplate = new DatedTemplate()
