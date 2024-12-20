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
      logUS('startPartialUrlSearch targetHostSettings', !!targetHostSettings, targetHostSettings)
    
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
