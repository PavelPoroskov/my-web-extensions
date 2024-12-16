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

const isPathnameMatch = ({ pathname, patternList }) => {
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

export const normalizeUrl = (url) => {
  logUA('getNormalizedUrl () 00', url)
  let cleanUrl = url
  let isPattern = false

  try {
    const oLink = new URL(url);
    const { hostname, pathname } = oLink;
    const targetHostSettings = targetHostSettingsMap.get(getHostBase(hostname))

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings

      if (isNotEmptyArray(removeAllSearchParamForPath)) {
        if (isPathnameMatch({ pathname, patternList: removeAllSearchParamForPath })) {
          // remove all query params
          isPattern = true
          oLink.search = ''
        }
      } else if (isNotEmptyArray(removeSearchParamList)) {
        // remove query params by list
        const oSearchParams = oLink.searchParams;
        const isHasThisSearchParams = removeSearchParamList.some((searchParam) => oSearchParams.get(searchParam) !== null)

        if (isHasThisSearchParams) {
          removeSearchParamList.forEach((searchParam) => {
            oSearchParams.delete(searchParam)
          })
          isPattern = true
          oLink.search = oSearchParams.size > 0
            ? `?${oSearchParams.toString()}`
            : ''
        }
      }

      cleanUrl = oLink.toString();  
    }
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }
  /* eslint-enable no-unused-vars */

  logUA('getNormalizedUrl () 99 cleanUrl', isPattern, cleanUrl)

  return cleanUrl
}

export function removeAnchorAndSearchParams(link) {
  try {
    const oLink = new URL(link);
    oLink.search = ''
    const resNoSearchParams = oLink.toString()
    const [resNoAnchor] = resNoSearchParams.split('#')
  
    return resNoAnchor;  
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return link
  }
}
