import {
  clearUrlTargetList 
} from './url.api.config.js'
import {
  makeLogFunction,
} from '../api/log.api.js'

const logUA = makeLogFunction({ module: 'url.api' })

const targetHostSettingsMap = new Map(
  clearUrlTargetList.map((item) => [
    item.hostname, 
    item,
  ])
)

const getHostBase = (str) => str.split('.').slice(-2).join('.')

const isPathnameMatchForPattern = ({ pathname, patternList }) => {
  logUA('isPathnameMatch () 00', pathname)
  logUA('isPathnameMatch () 00', patternList)

  const pathToList = (pathname) => {
    let list = pathname.split(/(\/)/)
  
    if (list.at(0) === '') {
      list = list.slice(1)
    }  
    if (list.at(-1) === '') {
      list = list.slice(0, -1)
    }  
    if (list.at(-1) === '/') {
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

const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0

export const removeQueryParamsIfTarget = (url) => {
  logUA('getNormalizedUrl () 00', url)
  let cleanUrl = url

  try {
    const oUrl = new URL(url);
    const { hostname, pathname } = oUrl;
    const targetHostSettings = targetHostSettingsMap.get(getHostBase(hostname))

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings
 
      if (isNotEmptyArray(removeSearchParamList)) {
        // remove query params by list
        const oSearchParams = oUrl.searchParams;
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
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }
  /* eslint-enable no-unused-vars */

  logUA('getNormalizedUrl () 99 cleanUrl', cleanUrl)

  return cleanUrl
}

function removeAnchorFromPathname(pathname) {
  const [pathnameNoAnchor] = pathname.split('#')

  return pathnameNoAnchor
}

export function removeAnchorAndSearchParams(url) {
  try {
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.pathname = removeAnchorFromPathname(oUrl.pathname)
  
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
  let lPathname = pathname

  // no anchor
  lPathname = removeAnchorFromPathname(lPathname)
  // no index in pathname
  lPathname = removeIndexFromPathname(lPathname)
  lPathname = removeLastSlashFromPathname(lPathname)

  return lPathname
}

export const getUrlForSearchWithPathname = (url) => {
  try {
    const oUrl = new URL(url);
    // no search params, but keep important params (https://www.youtube.com/watch?v=n85w)
    oUrl.search = ''
    oUrl.pathname = getPathnameForSearch(oUrl.pathname)
  
    return oUrl.toString();  
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}

export function isPathnameMatchForSearch({ url, pathnameForSearch }) {
  const oUrl = new URL(url);
  const normalizedPathname = getPathnameForSearch(oUrl.pathname);

  return normalizedPathname === pathnameForSearch
}

export const getRequiredSearchParamsForSearch = (url) => {
  let requiredSearchParams

  try {
    const oUrl = new URL(url);
    const { hostname } = oUrl;
    const targetHostSettings = targetHostSettingsMap.get(getHostBase(hostname))

    if (targetHostSettings) {
      const { importantSearchParamList } = targetHostSettings
 
      if (isNotEmptyArray(importantSearchParamList)) {
        const oSearchParams = oUrl.searchParams;
        requiredSearchParams = {}
        importantSearchParamList.forEach((searchParam) => {
          requiredSearchParams[searchParam] = oSearchParams.get(searchParam)
        })
      }
    }
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }

  return requiredSearchParams
}

export function isSearchParamsMatchForSearch({ url, requiredSearchParams }) {
  if (!requiredSearchParams) {
    return true
  }

  const oUrl = new URL(url);
  const oSearchParams = oUrl.searchParams;

  return Object.keys(requiredSearchParams)
    .every((key) => oSearchParams.get(key) === requiredSearchParams[key])
}