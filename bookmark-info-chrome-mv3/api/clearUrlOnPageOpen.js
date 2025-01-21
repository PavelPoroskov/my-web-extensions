import {
  removeQueryParamsIfTarget,
} from '../url-api/index.js'
import {
  USER_OPTION,
} from '../constant/index.js'
import {
  extensionSettings,
} from '../api-low/index.js'
import { page } from './page.api.js'

export async function clearUrlOnPageOpen({ tabId, url }) {
  let cleanUrl
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.CLEAR_URL_ON_PAGE_OPEN]) {
    cleanUrl = removeQueryParamsIfTarget(url);

    if (url !== cleanUrl) {
      await page.changeUrlInTab({ tabId, url: cleanUrl })
    }
  }

  return cleanUrl || url
}
