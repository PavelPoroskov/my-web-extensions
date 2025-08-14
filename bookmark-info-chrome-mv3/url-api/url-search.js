import {
  getHostSettings,
} from './url-settings.js'
import {
  getPathnameForSearch,
  getPathnamePart,
} from './url-partial.js'
import {
  makeIsSearchParamItemMatch,
} from './url-search-is.js'
import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'

const logUS = makeLogFunction({ module: 'url-search.js' })

function isHostnameMatchForSearch(hostname, requiredHostname) {
  return hostname === requiredHostname
}

function isSearchParamListMatchForPartialSearch(searchParams, requiredSearchParams) {
  if (!requiredSearchParams) {
    return true
  }

  return Object.entries(requiredSearchParams)
    .every(([key, value]) => searchParams.get(key) === value)
}

export async function startPartialUrlSearch({ url, pathnamePattern }) {
  logUS('startPartialUrlSearch () 00', url)

  try {
    const targetHostSettings = getHostSettings(url)
    logUS('startPartialUrlSearch 11 targetHostSettings', !!targetHostSettings, targetHostSettings)

    // if (!targetHostSettings) {
    //   return {
    //     isSearchAvailable: false,
    //   }
    // }

    const oUrl = new URL(url);

    let requiredSearchParams
    if (targetHostSettings) {
      const { importantSearchParamList } = targetHostSettings

      if (isNotEmptyArray(importantSearchParamList)) {
        const isSearchParamItemMatch = makeIsSearchParamItemMatch(importantSearchParamList)
        const oSearchParams = oUrl.searchParams;
        logUS('startPartialUrlSearch 22', 'oSearchParams', oSearchParams)

        const matchedParamList = []
        for (const [key, value] of oSearchParams) {
          logUS('startPartialUrlSearch 22', 'for (const [searchParam] of oSearchParams', key)
          if (isSearchParamItemMatch({ key, value })) {
            matchedParamList.push(key)
          }
        }

        requiredSearchParams = {}
        matchedParamList.forEach((searchParam) => {
          requiredSearchParams[searchParam] = oSearchParams.get(searchParam)
        })
      }
    }

    if (!targetHostSettings?.isHashRequired) {
      oUrl.hash = ''
    }


    let newPathname
    let isPathnameMatchForSearch

    if (pathnamePattern) {
      newPathname = getPathnamePart({
        pathname: oUrl.pathname,
        pattern: pathnamePattern,
      })

      isPathnameMatchForSearch = (pathname, requiredPathname) => {
        const normalizedPathname = getPathnamePart({ pathname, pattern: pathnamePattern })

        return normalizedPathname === requiredPathname
      }

    } else {
      newPathname = getPathnameForSearch(oUrl.pathname)

      isPathnameMatchForSearch = (pathname, requiredPathname) => {
        const normalizedPathname = getPathnameForSearch(pathname)

        return normalizedPathname === requiredPathname
      }
    }

    oUrl.pathname = newPathname
    oUrl.search = ''
    const urlForSearch = oUrl.toString();
    const {
      hostname: requiredHostname,
      pathname: requiredPathname,
    } = new URL(urlForSearch);

    logUS('startPartialUrlSearch 99', 'requiredSearchParams', requiredSearchParams)

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => {
        const oUrl = new URL(testUrl)

        return isHostnameMatchForSearch(oUrl.hostname, requiredHostname)
          && isPathnameMatchForSearch(oUrl.pathname, requiredPathname)
          && isSearchParamListMatchForPartialSearch(oUrl.searchParams, requiredSearchParams)
      }
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
