import {
  logSettings,
} from '../log-api.js'
import {
  getOptions, setOptions
} from '../storage-api.js'
import {
  STORAGE_KEY,
} from '../../constant/index.js';

class BrowserStartTime {
  _isActual = false
  startTime
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async getStartTime() {
    const storedSession = await getOptions(STORAGE_KEY.START_TIME)
    logSettings('storedSession', storedSession)

    let result

    if (storedSession[STORAGE_KEY.START_TIME]) {
      result = storedSession[STORAGE_KEY.START_TIME]
    } else {
      // I get start for service-worker now.
      //    It is correct if this web-extension was installed in the previous browser session
      // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
      //  tab with minimal tabId
      result = performance.timeOrigin
      await setOptions({
        [STORAGE_KEY.START_TIME]: this._profileStartTimeMS
      })
    }

    return result
  }
  async init() {
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    this.startTime = await this.getStartTime()
      .then(this.fnResolve)
      .then(this.fnReject)

    logSettings('profileStartTimeMS', new Date(this.startTime).toISOString())
  }
  async get() {
    await this.promise

    return this.startTime
  }
}

export const browserStartTime = new BrowserStartTime()