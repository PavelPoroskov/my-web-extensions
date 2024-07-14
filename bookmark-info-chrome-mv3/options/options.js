// TODO remove duplication clearUrlTargetList in options/options.js
const clearUrlTargetList = [
  {
    hostname: 'linkedin.com',  
    paths: [
      '/jobs/view/',
      '/posts/'
    ] 
  },
  {
    hostname: 'djinni.co',
    paths: [
      '/my/profile/',
      '/jobs/',
    ] 
  },
  {
    hostname: 'imdb.com',  
    paths: [
      '/title/',
      '/list/',
    ] 
  },
  {
    hostname: 'udemy.com',  
    paths: [
      '/course/',
    ] 
  },
]

const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const SHOW_PREVIOUS_VISIT_OPTION = {
  NEVER: 0,
  ONLY_NO_BKM: 1,
  ALWAYS: 2,
}

const STORAGE_KEY_META = {
  CLEAR_URL: {
    storageKey: 'CLEAR_URL_FROM_QUERY_PARAMS',
    default: true,
  },
  SHOW_PATH_LAYERS: {
    storageKey: 'SHOW_PATH_LAYERS',
    default: 1,
  },
  SHOW_PREVIOUS_VISIT: {
    storageKey: 'SHOW_PREVIOUS_VISIT',
    default: SHOW_PREVIOUS_VISIT_OPTION.ALWAYS,
  },
  SHOW_BOOKMARK_TITLE: {
    storageKey: 'SHOW_BOOKMARK_TITLE',
    default: false,
  },
  // SHOW_PROFILE: {
  //   storageKey: 'SHOW_PROFILE', 
  //   default: false,
  // },
  ADD_BOOKMARK_IS_ON: {
    storageKey: 'ADD_BOOKMARK',
    default: true,
  },
  ADD_BOOKMARK_LIST_SHOW: {
    storageKey: 'ADD_BOOKMARK_LIST_SHOW',
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  ADD_BOOKMARK_LIST_LIMIT: {
    storageKey: 'ADD_BOOKMARK_LIST_LIMIT', 
    default: 30,
  },
  ADD_BOOKMARK_TAG_LENGTH: {
    storageKey: 'ADD_BOOKMARK_TAG_LENGTH', 
    default: 15,
  },
  ADD_BOOKMARK_RECENT_MAP: {
    storageKey: 'ADD_BOOKMARK_RECENT_MAP',
    storage: STORAGE_TYPE.SESSION,
    default: {},
  },
  ADD_BOOKMARK_FIXED_MAP: {
    storageKey: 'ADD_BOOKMARK_FIXED_MAP',
    default: {},
  },
  START_TIME: {
    storageKey: 'START_TIME',
    storage: STORAGE_TYPE.SESSION,
  },
}

const STORAGE_KEY = Object.fromEntries(
  Object.keys(STORAGE_KEY_META).map((key) => [key, key])
)

async function setOptions(obj) {
  const entryList = Object.entries(obj)
    .map(([key, value]) => ({
      key, 
      storage: STORAGE_KEY_META[key].storage || STORAGE_TYPE.LOCAL,
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

  await Promise.all([
    localList.length > 0 && chrome.storage.local.set(localObj),
    sessionList.length > 0 && chrome.storage.session.set(sessionObj),
  ])
}

async function getOptions(keyList) {
  const inKeyList = Array.isArray(keyList) ? keyList : [keyList]

  const entryList = inKeyList
    .map((key) => ({
      key, 
      storage: STORAGE_KEY_META[key].storage || STORAGE_TYPE.LOCAL,
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

function formatTargetList () { 
  return clearUrlTargetList.toSorted().map(
  ({ hostname, paths }) => `${hostname}{${paths.toSorted().join(',')}}`
  )
}

function makeSaveCheckboxHandler(optionId) {
  return async function saveCheckboxHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await setOptions({
        [optionId]: element.checked
      })  
    }
  }
}

function makeSaveInputHandler(optionId) {
  return async function saveInputHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await setOptions({
        [optionId]: +element.value
      })  
    }
  }
}

function makeSaveSelectHandler(optionId) {
  return async function saveSelectHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await setOptions({
        [optionId]: +element.value
      })  
    }
  }
}

async function restoreOptions() {
  const settings = await getOptions([
    STORAGE_KEY.CLEAR_URL,
    STORAGE_KEY.SHOW_BOOKMARK_TITLE,
    STORAGE_KEY.SHOW_PATH_LAYERS,
    STORAGE_KEY.SHOW_PREVIOUS_VISIT,
    STORAGE_KEY.ADD_BOOKMARK_IS_ON,
    STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
    STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH,
  ]);

  let optionId = STORAGE_KEY.CLEAR_URL;
  let domId = `#${optionId}`
  let element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = 'CLEAR_URL_LIST';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = formatTargetList().join('\n');

  optionId = STORAGE_KEY.SHOW_BOOKMARK_TITLE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = STORAGE_KEY.SHOW_PATH_LAYERS;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  optionId = STORAGE_KEY.SHOW_PREVIOUS_VISIT;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('change', makeSaveSelectHandler(optionId) );

  optionId = STORAGE_KEY.ADD_BOOKMARK_IS_ON;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  optionId = STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );}

document.addEventListener('DOMContentLoaded', restoreOptions);
