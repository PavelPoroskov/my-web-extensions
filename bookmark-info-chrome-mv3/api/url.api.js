import {
  USER_OPTION 
} from './storage.api.config.js'
import {
  getHostSettings 
} from './url.api.config.js'
import {
  makeLogFunction,
} from './log.api.js'
import {
  isNotEmptyArray,
} from './common.api.js'
import {
  extensionSettings,
} from './structure/index.js'

const logUA = makeLogFunction({ module: 'url.api' })

const isPathnameMatchForPattern = ({ pathname, patternList }) => {
  logUA('isPathnameMatch () 00', pathname)
  logUA('isPathnameMatch () 00', patternList)

  const pathToList = (pathname) => {
    let list = pathname.split(/(\/)/).filter(Boolean)
  
    if (1 < list.length && list.at(-1) === '/') {
      list = list.slice(0, -1)
    }  
  
    return list
  }
  const isPartsEqual = (patternPart, pathPart) => {
    let result

    if (patternPart.startsWith(':')) {
      result = pathPart && pathPart != '/'
    } else {
      result = pathPart === patternPart
    } 
    logUA('isPartsEqual () 11', patternPart, pathPart, result)
  
    return result
  }
  
  let isMath = false
  const pathAsList = pathToList(pathname)
  logUA('isPathnameMatch () 11 pathAsList', pathAsList)

  let i = 0
  while (!isMath && i < patternList.length) {
    const pattern = patternList[i]
    const patternAsList = pathToList(pattern)
    logUA('isPathnameMatch () 11 patternAsList', patternAsList)

    isMath = patternAsList.length > 0 && pathAsList.length === patternAsList.length 
      && patternAsList.every((patternPart, patternIndex) => isPartsEqual(patternPart, pathAsList[patternIndex])
    )
    i += 1
  }

  return isMath
}

export const removeQueryParamsIfTarget = (url) => {
  logUA('removeQueryParamsIfTarget () 00', url)
  let cleanUrl = url

  try {
    const targetHostSettings = getHostSettings(url)
    logUA('removeQueryParamsIfTarget () 11 targetHostSettings', targetHostSettings)

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings
      logUA('removeQueryParamsIfTarget () 22 removeSearchParamList', removeSearchParamList)
 
      const oUrl = new URL(url);
      const { pathname, searchParams: oSearchParams } = oUrl;

      if (isNotEmptyArray(removeSearchParamList)) {
        logUA('removeQueryParamsIfTarget () 33 isNotEmptyArray(removeSearchParamList)')
        // remove query params by list
        const isHasThisSearchParams = removeSearchParamList.some((searchParam) => oSearchParams.get(searchParam) !== null)

        if (isHasThisSearchParams) {
          removeSearchParamList.forEach((searchParam) => {
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

  logUA('removeQueryParamsIfTarget () 99 cleanUrl', cleanUrl)

  return cleanUrl
}

export function removeAnchorAndSearchParams(url) {
  logUA('removeAnchorAndSearchParams () 00', url)
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

export async function startPartialUrlSearch(url) {
  const settings = await extensionSettings.get()
  if (!settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]) {
    return {
      isSearchAvailable: false,
    }
  }

  logUA('startPartialUrlSearch () 00', url)

  try {
    const targetHostSettings = getHostSettings(url)
    logUA('startPartialUrlSearch targetHostSettings', !!targetHostSettings, targetHostSettings)
  
    if (!targetHostSettings) {
      return {
        isSearchAvailable: false,
      }
    }
  
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.hash = ''
    oUrl.pathname = getPathnameForSearch(oUrl.pathname)
    const urlForSearch = oUrl.toString();  

    let requiredSearchParams
    const { importantSearchParamList } = targetHostSettings

    if (isNotEmptyArray(importantSearchParamList)) {
      const oSearchParams = oUrl.searchParams;
      requiredSearchParams = {}
      importantSearchParamList.forEach((searchParam) => {
        requiredSearchParams[searchParam] = oSearchParams.get(searchParam)
      })
    }

    const { pathname: pathnameForSearch } = new URL(urlForSearch);

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => isPathnameMatchForSearch({ url: testUrl, pathnameForSearch })
        && isSearchParamsMatchForSearch({ url: testUrl, requiredSearchParams })
    }
  // eslint-disable-next-line no-unused-vars
  } catch (_e) 
  {
    return {
      isSearchAvailable: false,
    }
  }  
}