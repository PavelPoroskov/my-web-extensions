import {
  makeLogFunction,
} from './log.api.js'
import {
  isNotEmptyArray,
} from './common.api.js'
import {
  HOST_URL_SETTINGS,
} from '../constant/url.api.config.js'

const logUAC = makeLogFunction({ module: 'url.api.js' })

function extendsSettings(oSettings) {
  let mSettings = typeof oSettings == 'string'
    ? HOST_URL_SETTINGS[oSettings]
    : oSettings

  const searchParamList = mSettings.searchParamList || []
  const importantSearchParamList = searchParamList
    .filter((searchParmName) => typeof searchParmName == 'string')
    .filter(Boolean)

  const removeSearchParamList = searchParamList
    .filter((searchParm) => isNotEmptyArray(searchParm))
    .map((searchParm) => searchParm[0])
    .filter(Boolean)

  return {
    ...mSettings,
    removeSearchParamList,
    importantSearchParamList,
    isAlias: typeof oSettings == 'string',
  }
}

const HOST_URL_SETTINGS_LIST = Object.entries(HOST_URL_SETTINGS)
  .map(([hostname, oSettings]) => [
    hostname,
    extendsSettings(oSettings)
  ])

export const HOST_LIST_FOR_PAGE_OPTIONS = HOST_URL_SETTINGS_LIST
  .toSorted((a, b) => a[0].localeCompare(b[0]))
  .filter(([, obj]) => (isNotEmptyArray(obj.removeSearchParamList) || isNotEmptyArray(obj.removeAllSearchParamForPath)) && !obj.isAlias)
    .map(
      ([hostname, obj]) => `${hostname}{${(obj.removeAllSearchParamForPath || []).toSorted().join(',')}}`
    )

// logUAC('HOST_URL_SETTINGS', HOST_URL_SETTINGS)
const HOST_URL_SETTINGS_MAP = new Map(HOST_URL_SETTINGS_LIST)

export const getHostSettings = (url) => {
  logUAC('getHostSettings 00', url)
  const oUrl = new URL(url);
  const { hostname } = oUrl;
  logUAC('getHostSettings 11', hostname)
  // logUAC('HOST_URL_SETTINGS_MAP', HOST_URL_SETTINGS_MAP)

  let targetHostSettings = HOST_URL_SETTINGS_MAP.get(hostname)
  logUAC('targetHostSettings 22 hostname', targetHostSettings)

  if (!targetHostSettings) {
    const [firstPart, ...restPart] = hostname.split('.')
    logUAC('targetHostSettings 33', firstPart, restPart.join('.'))

    if (firstPart == 'www') {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(restPart.join('.'))
      logUAC('targetHostSettings 44', targetHostSettings)
    } else {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(`www.${hostname}`)
      logUAC('targetHostSettings 55', targetHostSettings)
    }
  }

  if (!targetHostSettings) {
    const baseDomain = hostname.split('.').slice(-2).join('.')

    targetHostSettings = HOST_URL_SETTINGS_MAP.get(baseDomain)
    logUAC('targetHostSettings 66 baseDomain', baseDomain, targetHostSettings)
  }

  return targetHostSettings
}
