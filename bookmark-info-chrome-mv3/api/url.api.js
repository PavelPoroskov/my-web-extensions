import {
  isNotEmptyArray,
  makeLogFunction,
} from '../api-low/index.js'
import {
  DEFAULT_HOST_SETTINGS,
  HOST_URL_SETTINGS,
  HOST_URL_SETTINGS_SHORT,
} from '../constant/url.api.config.js'

const logUA = makeLogFunction({ module: 'url.api.js' })

function extendsSettings(oSettings) {
  let mSettings = typeof oSettings == 'string'
    ? HOST_URL_SETTINGS[oSettings]
    : oSettings

  const { searchParamList, ...rest } = mSettings
  const mSearchParamList = searchParamList || []
  const importantSearchParamList = mSearchParamList
    .filter((searchParmName) => typeof searchParmName == 'string')
    .filter(Boolean)

  const removeSearchParamList = mSearchParamList
    .filter((searchParm) => isNotEmptyArray(searchParm))
    .map((searchParm) => searchParm[0])
    .filter(Boolean)

  return {
    ...rest,
    removeSearchParamList,
    importantSearchParamList,
    isAlias: typeof oSettings == 'string',
  }
}

function mergeSettings(oSettings, oDefaultSettings) {
  const getUniq = (ar1, ar2) => Array.from(new Set(ar1.concat(ar2)))

  const {
    removeSearchParamList,
    importantSearchParamList,
    ...rest
  } = oSettings
  const {
    removeSearchParamList: defaultRemoveSearchParamList,
    importantSearchParamList: defaultImportantSearchParamList,
    ...defaultRest
  } = oDefaultSettings

  return {
    ...defaultRest,
    ...rest,
    removeSearchParamList: getUniq(removeSearchParamList, defaultRemoveSearchParamList),
    importantSearchParamList: getUniq(importantSearchParamList, defaultImportantSearchParamList),
  }
}

const DEFAULT_HOST_SETTINGS_EXT = extendsSettings(DEFAULT_HOST_SETTINGS)

const HOST_URL_SETTINGS_LIST = Object.entries(HOST_URL_SETTINGS)
  .map(([hostname, oSettings]) => [
    hostname,
    mergeSettings(extendsSettings(oSettings), DEFAULT_HOST_SETTINGS_EXT)
  ])

const HOST_URL_SETTINGS_MAP = new Map(HOST_URL_SETTINGS_LIST)

export const getHostSettings = (url) => {
  logUA('getHostSettings 00', url)
  const oUrl = new URL(url);
  const { hostname } = oUrl;
  logUA('getHostSettings 11', hostname)

  let targetHostSettings = HOST_URL_SETTINGS_MAP.get(hostname)
  logUA('targetHostSettings 22 hostname', targetHostSettings)

  if (!targetHostSettings) {
    const [firstPart, ...restPart] = hostname.split('.')
    logUA('targetHostSettings 33', firstPart, restPart.join('.'))

    if (firstPart == 'www') {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(restPart.join('.'))
      logUA('targetHostSettings 44', targetHostSettings)
    } else {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(`www.${hostname}`)
      logUA('targetHostSettings 55', targetHostSettings)
    }
  }

  if (!targetHostSettings) {
    const baseDomain = hostname.split('.').slice(-2).join('.')

    targetHostSettings = HOST_URL_SETTINGS_MAP.get(baseDomain)
    logUA('targetHostSettings 66 baseDomain', baseDomain, targetHostSettings)
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
  logUA('makeIsSearchParamMatch () 00', patternList)
  const isFnList = []

  patternList.forEach((pattern) => {
    logUA('makeIsSearchParamMatch () 11', 'pattern', pattern)
    const asteriskIndex = pattern.indexOf('*')
    const partsLength = pattern.split('*').length
    switch (true) {
      case asteriskIndex < 0: {
        const fullPattern = pattern
        isFnList.push((s) => s == fullPattern)
        logUA('makeIsSearchParamMatch () 11', '(s) => s == fullPattern', fullPattern)
        break
      }
      case asteriskIndex == 0 && partsLength == 2: {
        if (pattern.length == 1) {
          isFnList.push(() => true)
          logUA('makeIsSearchParamMatch () 11', '() => true', pattern)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          // isFnList.push((s) => s.endsWith(end) && end.length < s.length)
          isFnList.push((s) => s.endsWith(end))
          logUA('makeIsSearchParamMatch () 11', '(s) => s.endsWith(end)', end)
        }
        break
      }
      case 0 < asteriskIndex && partsLength == 2: {
        const start = pattern.slice(0, asteriskIndex)
        if (asteriskIndex == pattern.length - 1) {
          isFnList.push((s) => s.startsWith(start))
          logUA('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start)', start)
        } else {
          const end = pattern.slice(asteriskIndex + 1)
          const minLength = start.length + end.length
          isFnList.push((s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length)
          logUA('makeIsSearchParamMatch () 11', '(s) => s.startsWith(start) && s.endsWith(end) && minLength <= s.length', start, end)
        }
      }
    }
  })

  logUA('makeIsSearchParamMatch () 99', 'isFnList.length', isFnList.length)
  return (name) => isFnList.some((isFn) => isFn(name))
}

