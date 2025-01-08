import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'
import {
  DEFAULT_HOST_SETTINGS,
  HOST_URL_SETTINGS,
  HOST_URL_SETTINGS_SHORT,
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

const HOST_URL_SETTINGS_MAP = new Map(HOST_URL_SETTINGS_LIST)

const DEFAULT_HOST_SETTINGS_EXT = extendsSettings(DEFAULT_HOST_SETTINGS)
export const getHostSettings = (url) => {
  logUAC('getHostSettings 00', url)
  const oUrl = new URL(url);
  const { hostname } = oUrl;
  logUAC('getHostSettings 11', hostname)

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

  return targetHostSettings || DEFAULT_HOST_SETTINGS_EXT
}

const HOST_URL_SETTINGS_LIST_SHORT = Object.entries(HOST_URL_SETTINGS_SHORT)
  .map(([hostname, oSettings]) => [
    hostname,
    extendsSettings(oSettings)
  ])

export const HOST_LIST_FOR_PAGE_OPTIONS = HOST_URL_SETTINGS_LIST_SHORT
  .toSorted((a, b) => a[0].localeCompare(b[0]))
  .filter(([, obj]) => (isNotEmptyArray(obj.removeSearchParamList) || isNotEmptyArray(obj.removeAllSearchParamForPath)) && !obj.isAlias)
    .map(
      ([hostname, obj]) => `${hostname}{${(obj.removeAllSearchParamForPath || []).toSorted().join(',')}}`
    )

export function makeIsSearchParamMatch(patternList) {
  const isFnList = []

  patternList.forEach((pattern) => {
    const asteriskIndex = pattern.indexOf('*')
    const partsLength = pattern.split('*').length
    switch (true) {
      case asteriskIndex < 0: {
        const fullPattern = pattern
        isFnList.push((s) => s == fullPattern)
        break
      }
      case asteriskIndex == 0 && partsLength == 2: {
        if (pattern.length == 1) {
          isFnList.push(() => true)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          // isFnList.push((s) => s.endsWith(end) && end.length < s.length)
          isFnList.push((s) => s.endsWith(end))
        }
        break
      }
      case 0 < asteriskIndex && partsLength == 2: {
        const start = pattern.slice(0, asteriskIndex)
        if (asteriskIndex == pattern.length - 1) {
          isFnList.push((s) => s.startsWith(start))
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          const minLength = start.length + end.length
          isFnList.push((s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length)
        }
      }
    }
  })

  return (name) => isFnList.some((isFn) => isFn(name))
}

