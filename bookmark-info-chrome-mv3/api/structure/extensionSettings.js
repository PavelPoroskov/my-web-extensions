import {
  logSettings,
} from '../log-api.js'
import {
  getOptions, setOptions
} from '../storage-api.js'
import {
  STORAGE_KEY,
} from '../../constant/index.js';

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
    logSettings('readSavedSettings START')
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await getOptions([
      STORAGE_KEY.ADD_BOOKMARK_HIGHLIGHT_LAST,
      STORAGE_KEY.ADD_BOOKMARK_IS_ON,
      STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
      STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
      STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH,
      STORAGE_KEY.HIDE_TAG_HEADER_ON_PRINTING,
      STORAGE_KEY.CLEAR_URL,
      STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE,
      STORAGE_KEY.SHOW_BOOKMARK_TITLE,
      STORAGE_KEY.SHOW_PREVIOUS_VISIT,
    ])
      .then((result) => {
        this._settings = result
        this.fnResolve()
      })
      .catch(this.fnReject);
    logSettings('readSavedSettings')
    logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  
  }

  async update(updateObj) {
    Object.entries(updateObj).forEach(([ket, value]) => {
      this._settings[ket] = value
    })
    
    await setOptions(updateObj)
  }
}

export const extensionSettings = new ExtensionSettings()