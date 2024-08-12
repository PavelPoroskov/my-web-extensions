// TODO remove duplication setOptions(), getOptions() in options/options.js
//  ?import script in options.html
//  <script src="options.js"> type="module"


const wait = ms => new Promise(res => setTimeout(res, ms));

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

function formatTargetList (clearUrlTargetList) { 
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
  element.value = formatTargetList(clearUrlTargetList).join('\n');

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
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  const value = document.querySelector(`#${optionId}-VALUE`);
  value.textContent = element.value;
  element.addEventListener("input", (event) => {
    value.textContent = event.target.value;
  });

  optionId = 'FLAT_BOOKMARKS';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({
      command: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
    });
    const text = 'Operation started'
    const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
    value.textContent = text;

    await wait(50)
  });

  optionId = 'DELETE_DOUBLES';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({
      command: 'OPTIONS_ASKS_DELETE_DOUBLES',
    });
    const text = 'Operation started'
    const value = document.querySelector('#DELETE_DOUBLES_RESULT');
    value.textContent = text;

    await wait(50)
  });
}

let clearUrlTargetList
let STORAGE_TYPE
let STORAGE_KEY_META
let STORAGE_KEY

chrome.runtime.onMessage.addListener(async (message) => {
  switch (message?.command) {
    case 'DATA_FOR_OPTIONS': {
      // console.log('option in DATA_FOR_OPTIONS')
      clearUrlTargetList = message.clearUrlTargetList
      STORAGE_TYPE = message.STORAGE_TYPE
      STORAGE_KEY_META = message.STORAGE_KEY_META
      STORAGE_KEY = message.STORAGE_KEY
      restoreOptions()
      break
    }
    case 'FLAT_BOOKMARKS_RESULT': {
      // console.log('option in FLAT_BOOKMARKS_RESULT', message.success)
      const text = message.success 
        ? 'Operation completed successfully'
        : 'Operation failed'
      const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
      // TODO it is not updated in form for firefox. chrome is ok
      //  message has received, element is found
      //  may be debug mode
      value.textContent = text;
      await wait(50)

      break
    }
    case 'DELETE_DOUBLES_RESULT': {
      const text = message.success 
        ? `Operation completed successfully. Deleted ${message.nRemovedDoubles}`
        : 'Operation failed'
      const value = document.querySelector('#DELETE_DOUBLES_RESULT');
      value.textContent = text;
      await wait(50)

      break
    }
  }
})
//document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.runtime.sendMessage({
    command: 'OPTIONS_ASKS_DATA',
  });
});
