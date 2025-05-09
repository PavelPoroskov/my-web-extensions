import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'
import {
  getHostSettings,
} from './url-settings.js'
import {
  isPathnameMatchForPatternExactly,
  makeIsSearchParamMatch,
} from './url-search-is.js'

const logCUA = makeLogFunction({ module: 'clear-url.js' })

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
        const isMath = removeAllSearchParamForPath.some((pathPattern) => isPathnameMatchForPatternExactly(pathname, pathPattern))
        if (isMath) {
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

export function removeHashAndSearchParams(url) {
  // logCUA('removeHashAndSearchParams () 00', url)
  try {
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.hash = ''

    return oUrl.toString();
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}
