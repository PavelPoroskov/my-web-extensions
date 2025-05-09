import {
  getHostSettings,
} from './url-settings.js'
import {
  getPathnameForSearch,
  getPathnamePart,
} from './url-partial.js'
import {
  makeIsSearchParamMatch,
} from './url-search-is.js'
import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'

const logUS = makeLogFunction({ module: 'url-search.js' })

function isHostnameMatchForSearch(hostname, requiredHostname) {
  return hostname === requiredHostname
}

function isSearchParamsMatchForSearch(searchParams, requiredSearchParams) {
  if (!requiredSearchParams) {
    return true
  }

  return Object.keys(requiredSearchParams)
    .every((key) => searchParams.get(key) === requiredSearchParams[key])
}

// ?TODO /posts == /posts?page=1 OR clean on open /posts?page=1 TO /posts IF page EQ 1
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
        const isSearchParamMatch = makeIsSearchParamMatch(importantSearchParamList)
        const oSearchParams = oUrl.searchParams;
        logUS('startPartialUrlSearch 22', 'oSearchParams', oSearchParams)

        const matchedParamList = []
        for (const [searchParam] of oSearchParams) {
          logUS('startPartialUrlSearch 22', 'for (const [searchParam] of oSearchParams', searchParam)
          if (isSearchParamMatch(searchParam)) {
            matchedParamList.push(searchParam)
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
    }

    if (newPathname) {
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
          && isSearchParamsMatchForSearch(oUrl.searchParams, requiredSearchParams)
      }
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
