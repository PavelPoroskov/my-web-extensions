import {
  USER_OPTION,
} from '../constant/index.js'
import {
  extensionSettings,
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'
import {
  getHostSettings,
} from './url.api.js'
import {
  isPathnameMatchForPattern,
  makeIsSearchParamMatch,
} from './url-is.js'
import { page } from './page.api.js'

const logCUA = makeLogFunction({ module: 'clear-url.api.js' })

export const removeQueryParamsIfTarget = (url) => {
  logCUA('removeQueryParamsIfTarget () 00', url)
  let cleanUrl = url

  try {
    const targetHostSettings = getHostSettings(url)
    logCUA('removeQueryParamsIfTarget () 11 targetHostSettings', targetHostSettings)

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings
      logCUA('removeQueryParamsIfTarget () 22 removeSearchParamList', removeSearchParamList)

      const oUrl = new URL(url);
      const { pathname, searchParams: oSearchParams } = oUrl;

      if (isNotEmptyArray(removeSearchParamList)) {
        logCUA('removeQueryParamsIfTarget () 33 isNotEmptyArray(removeSearchParamList)')

        const isSearchParamMatch = makeIsSearchParamMatch(removeSearchParamList)

        const matchedParamList = []
        for (const [searchParam] of oSearchParams) {
          if (isSearchParamMatch(searchParam)) {
            matchedParamList.push(searchParam)
          }
        }
        // remove query params by list
        const isHasThisSearchParams = 0 < matchedParamList.length

        if (isHasThisSearchParams) {
          matchedParamList.forEach((searchParam) => {
            oSearchParams.delete(searchParam)
          })
          oUrl.search = oSearchParams.size > 0
            ? `?${oSearchParams.toString()}`
            : ''
        }
      }

      if (isNotEmptyArray(removeAllSearchParamForPath)) {
        if (isPathnameMatchForPattern({ pathname, patternList: removeAllSearchParamForPath })) {
          // remove all search params
          oUrl.search = ''
        }
      }

      cleanUrl = oUrl.toString();
    }

  // eslint-disable-next-line no-unused-vars
  } catch (_e)
  // eslint-disable-next-line no-empty
  {

  }

  logCUA('removeQueryParamsIfTarget () 99 cleanUrl', cleanUrl)

  return cleanUrl
}

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
