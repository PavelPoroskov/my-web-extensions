import {
  page,
} from '../api-mid/index.js'
// import {
//   makeLogFunction,
// } from '../api-low/index.js'
import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'

// const logPR = makeLogFunction({ module: 'pageReady.js' })

class PageReady {
  constructor () {
    this.isOn = false
  }

  async clearUrlOnPageOpen({ tabId, url }) {
    if (!this.isOn) {
      return
    }

    const cleanUrl = removeQueryParamsIfTarget(url);

    if (url !== cleanUrl) {
      await page.changeUrlInTab({ tabId, url: cleanUrl })
    }
  }

  useSettings({ isOn }) {
    this.isOn = isOn
  }
}

export const pageReady = new PageReady()
