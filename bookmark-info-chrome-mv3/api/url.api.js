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

  let oUrl
  try {
    oUrl = new URL(url);
    // eslint-disable-next-line no-unused-vars
  } catch (notUrlErr) {
    return DEFAULT_HOST_SETTINGS_EXT
  }

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
