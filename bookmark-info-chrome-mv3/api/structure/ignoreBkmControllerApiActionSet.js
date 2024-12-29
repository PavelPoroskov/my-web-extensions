// ignore create from api to detect create from user
class IgnoreBkmControllerApiActionSet {
  constructor() {
    this._innerSet = new Set();
  }
  addIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    this._innerSet.add(innerKey)
  }
  hasIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    const isHas = this._innerSet.has(innerKey)
    if (isHas) {
      this._innerSet.delete(innerKey)
    }

    return isHas
  }
  addIgnoreMove(bkmId) {
    const innerKey = `move#${bkmId}`

    this._innerSet.add(innerKey)
  }
  hasIgnoreMove(bkmId) {
    const innerKey = `move#${bkmId}`

    const isHas = this._innerSet.has(innerKey)
    if (isHas) {
      this._innerSet.delete(innerKey)
    }

    return isHas
  }
}

export const ignoreBkmControllerApiActionSet = new IgnoreBkmControllerApiActionSet()
