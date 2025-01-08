import {
  makeLogFunction,
} from '../api-low/log.api.js'
import {
  STORAGE_TYPE,
  STORAGE_KEY_META,
} from '../constant/storage.api.config.js'
export * from '../constant/storage.api.config.js'

const logSA = makeLogFunction({ module: 'storage.api.js' })

export async function setOptions(obj) {
  const entryList = Object.entries(obj)
    .map(([key, value]) => ({
      key,
      storage: STORAGE_KEY_META[key].storage,
      value,
    }))

  const localList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.LOCAL)
  const localObj = Object.fromEntries(
    localList.map(({ key, value }) => [STORAGE_KEY_META[key].storageKey, value])
  )

  const sessionList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.SESSION)
  const sessionObj = Object.fromEntries(
    sessionList.map(({ key, value }) => [STORAGE_KEY_META[key].storageKey, value])
  )

  logSA('setOptions localObj', localObj)
  logSA('setOptions sessionObj', sessionObj)
  await Promise.all([
    localList.length > 0 && chrome.storage.local.set(localObj),
    sessionList.length > 0 && chrome.storage.session.set(sessionObj),
  ])
}

export async function getOptions(keyList) {
  const inKeyList = Array.isArray(keyList) ? keyList : [keyList]

  const entryList = inKeyList
    .map((key) => ({
      key,
      storage: STORAGE_KEY_META[key].storage,
    }))

  const localList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.LOCAL)
    .map(({ key }) => key)

  const sessionList = entryList
    .filter((item) => item.storage === STORAGE_TYPE.SESSION)
    .map(({ key }) => key)

  const [
    localStoredObj,
    sessionStoredObj,
  ] = await Promise.all([
    localList.length > 0
      ? chrome.storage.local.get(
        localList.map((key) => STORAGE_KEY_META[key].storageKey)
      )
      : {},
    sessionList.length > 0
      ? chrome.storage.session.get(
        sessionList.map((key) => STORAGE_KEY_META[key].storageKey)
      )
      : {},
  ])

  const localObj = Object.fromEntries(
    localList.map((key) => {
      const storageKey = STORAGE_KEY_META[key].storageKey

      return [
        key,
        localStoredObj[storageKey] !== undefined
          ? localStoredObj[storageKey]
          : STORAGE_KEY_META[key].default
      ]
    })
  )
  const sessionObj = Object.fromEntries(
    sessionList.map((key) => {
      const storageKey = STORAGE_KEY_META[key].storageKey

      return [
        key,
        sessionStoredObj[storageKey] !== undefined
          ? sessionStoredObj[storageKey]
          : STORAGE_KEY_META[key].default
      ]
    })
  )

  return {
    ...localObj,
    ...sessionObj,
  }
}

