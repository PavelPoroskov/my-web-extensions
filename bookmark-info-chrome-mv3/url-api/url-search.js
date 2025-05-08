import {
  getHostSettings,
} from './url-settings.js'
import {
  getPathnamePart,
  makeIsSearchParamMatch,
} from './url-search-is.js'
import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'

const logUS = makeLogFunction({ module: 'url-search.js' })

function isHostnameMatchForSearch({ oUrl, hostname }) {
  return oUrl.hostname === hostname
}

function removeIndexFromPathname(pathname) {
  let list = pathname.split(/(\/)/)
  const last = list.at(-1)

  if (last.startsWith('index.') || last === 'index') {
    list = list.slice(0, -1)
  }

  return list.join('')
}

function removeLastSlashFromPathname(pathname) {
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
}

export const getPathnameForSearch = (pathname) => {
  let mPathname = pathname

  // no index in pathname
  mPathname = removeIndexFromPathname(mPathname)
  mPathname = removeLastSlashFromPathname(mPathname)

  return mPathname
}

// function isPathnameMatchForSearch({ oUrl, pathname }) {
//   const normalizedPathname = getPathnameForSearch(oUrl.pathname);

//   return normalizedPathname === pathname
// }

function makeIsPathnameMatchForSearch({ normalizePathname }) {

  return function isPathnameMatchForSearch({ oUrl, pathname }) {
    const normalizedPathname = normalizePathname(oUrl.pathname);

    return normalizedPathname === pathname
  }
}

function isSearchParamsMatchForSearch({ oUrl, requiredSearchParams }) {
  if (!requiredSearchParams) {
    return true
  }

  const oSearchParams = oUrl.searchParams;

  return Object.keys(requiredSearchParams)
    .every((key) => oSearchParams.get(key) === requiredSearchParams[key])
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
      isPathnameMatchForSearch = makeIsPathnameMatchForSearch({
        normalizePathname: (str) => getPathnamePart({
          pathname: str,
          pattern: pathnamePattern,
        })
      })
    } else {
      newPathname = getPathnameForSearch(oUrl.pathname)
      isPathnameMatchForSearch = makeIsPathnameMatchForSearch({ normalizePathname: getPathnameForSearch })
    }
    oUrl.pathname = newPathname

    oUrl.search = ''
    const urlForSearch = oUrl.toString();
    const {
      hostname: hostnameForSearch,
      pathname: pathnameForSearch,
    } = new URL(urlForSearch);

    logUS('startPartialUrlSearch 99', 'requiredSearchParams', requiredSearchParams)

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => {
        const oUrl = new URL(testUrl)

        return isHostnameMatchForSearch({ oUrl, hostname: hostnameForSearch })
          && isPathnameMatchForSearch({ oUrl, pathname: pathnameForSearch })
          && isSearchParamsMatchForSearch({ oUrl, requiredSearchParams })
      }
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
