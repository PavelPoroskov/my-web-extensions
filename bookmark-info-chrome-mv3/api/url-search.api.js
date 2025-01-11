import {
  USER_OPTION
} from '../constant/index.js'
import {
  getHostSettings,
} from './url.api.js'
import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'
import {
  extensionSettings,
} from '../data-structures/index.js'

const logUS = makeLogFunction({ module: 'url-search.api' })

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

function isPathnameMatchForSearch({ url, pathnameForSearch }) {
  const oUrl = new URL(url);
  const normalizedPathname = getPathnameForSearch(oUrl.pathname);

  return normalizedPathname === pathnameForSearch
}

function isSearchParamsMatchForSearch({ url, requiredSearchParams }) {
  if (!requiredSearchParams) {
    return true
  }

  const oUrl = new URL(url);
  const oSearchParams = oUrl.searchParams;

  return Object.keys(requiredSearchParams)
    .every((key) => oSearchParams.get(key) === requiredSearchParams[key])
}

export function makeIsSearchParamMatch(patternList) {
  logUS('makeIsSearchParamMatch () 00', patternList)
  const isFnList = []

  patternList.forEach((pattern) => {
    logUS('makeIsSearchParamMatch () 11', 'pattern', pattern)
    const asteriskIndex = pattern.indexOf('*')
    const partsLength = pattern.split('*').length
    switch (true) {
      case asteriskIndex < 0: {
        const fullPattern = pattern
        isFnList.push((s) => s == fullPattern)
        logUS('makeIsSearchParamMatch () 11', '(s) => s == fullPattern', fullPattern)
        break
      }
      case asteriskIndex == 0 && partsLength == 2: {
        if (pattern.length == 1) {
          isFnList.push(() => true)
          logUS('makeIsSearchParamMatch () 11', '() => true', pattern)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          // isFnList.push((s) => s.endsWith(end) && end.length < s.length)
          isFnList.push((s) => s.endsWith(end))
          logUS('makeIsSearchParamMatch () 11', '(s) => s.endsWith(end)', end)
        }
        break
      }
      case 0 < asteriskIndex && partsLength == 2: {
        const start = pattern.slice(0, asteriskIndex)
        if (asteriskIndex == pattern.length - 1) {
          isFnList.push((s) => s.startsWith(start))
          logUS('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start)', start)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          const minLength = start.length + end.length
          isFnList.push((s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length)
          logUS('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length', start, end)
        }
      }
    }
  })

  logUS('makeIsSearchParamMatch () 99', 'isFnList.length', isFnList.length)
  return (name) => isFnList.some((isFn) => isFn(name))
}

export async function startPartialUrlSearch(url) {
  const settings = await extensionSettings.get()
  if (!settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]) {
    return {
      isSearchAvailable: false,
    }
  }

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
    oUrl.pathname = getPathnameForSearch(oUrl.pathname)
    oUrl.search = ''
    const urlForSearch = oUrl.toString();

    const { pathname: pathnameForSearch } = new URL(urlForSearch);

    logUS('startPartialUrlSearch 99', 'requiredSearchParams', requiredSearchParams)

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => isPathnameMatchForSearch({ url: testUrl, pathnameForSearch })
        && isSearchParamsMatchForSearch({ url: testUrl, requiredSearchParams })
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
