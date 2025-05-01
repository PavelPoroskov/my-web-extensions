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

  makeAddIgnoreAction(action) {
    return function (bkmId) {
      const innerKey = `${action}#${bkmId}`
      this._innerSet.add(innerKey)
    }
  }
  makeHasIgnoreAction(action) {
    return function (bkmId) {
      const innerKey = `${action}#${bkmId}`

      const isHas = this._innerSet.has(innerKey)
      if (isHas) {
        this._innerSet.delete(innerKey)
      }

      return isHas
    }
  }

  addIgnoreMove = this.makeAddIgnoreAction('move')
  hasIgnoreMove = this.makeHasIgnoreAction('move')

  // addIgnoreRemove = this.makeAddIgnoreAction('remove')
  // hasIgnoreRemove = this.makeHasIgnoreAction('remove')

  // addIgnoreUpdate = this.makeAddIgnoreAction('update')
  // hasIgnoreUpdate = this.makeHasIgnoreAction('update')
}

export const ignoreBkmControllerApiActionSet = new IgnoreBkmControllerApiActionSet()
