import {
  getOptions,
  setOptions,
  makeLogFunction,
} from '../api-low/index.js'
import {
  USER_OPTION_KEY_LIST,
} from '../constant/index.js'

const logES = makeLogFunction({ module: 'extensionSettings.js' })

class ExtensionSettings {
  _isActual = false
  _settings = {}
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async get() {
    await this.promise

    return { ...this._settings }
  }
  invalidate () {
    this._isActual = false
  }
  async restoreFromStorage() {
    logES('readSavedSettings START')
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await getOptions(USER_OPTION_KEY_LIST)
      .then((result) => {
        this._settings = result
        this.fnResolve()
      })
      .catch(this.fnReject);

    logES('readSavedSettings')
    logES(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)
  }

  async update(updateObj) {
    Object.entries(updateObj).forEach(([ket, value]) => {
      this._settings[ket] = value
    })

    await setOptions(updateObj)
  }
}

export const extensionSettings = new ExtensionSettings()
