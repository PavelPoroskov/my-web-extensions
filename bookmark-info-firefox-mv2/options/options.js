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
]

function formatTargetList () { 
  return clearUrlTargetList.toSorted().map(
  ({ hostname, paths }) => `${hostname}{${paths.toSorted().join(',')}}`
  )
}

const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
  SHOW_PATH_LAYERS: 'SHOW_PATH_LAYERS',
  SHOW_PREVIOUS_VISIT: 'SHOW_PREVIOUS_VISIT',
  SHOW_BOOKMARK_TITLE: 'SHOW_BOOKMARK_TITLE',
  SHOW_PROFILE: 'SHOW_PROFILE',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
}

const SHOW_PREVIOUS_VISIT_OPTION = {
  NEVER: 0,
  ONLY_NO_BKM: 1,
  ALWAYS: 2,
}

const o = USER_SETTINGS_OPTIONS
const USER_SETTINGS_DEFAULT_VALUE = {
  [o.CLEAR_URL_FROM_QUERY_PARAMS]: true,
  [o.SHOW_PATH_LAYERS]: 1,
  [o.SHOW_PREVIOUS_VISIT]: SHOW_PREVIOUS_VISIT_OPTION.ALWAYS,
  [o.SHOW_BOOKMARK_TITLE]: false,
  [o.SHOW_PROFILE]: false,
  [o.ADD_BOOKMARK]: false,
}

function makeSaveCheckboxHandler(optionId) {
  return async function saveCheckboxHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await browser.storage.local.set({
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
      await browser.storage.local.set({
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
      await browser.storage.local.set({
        [optionId]: +element.value
      })  
    }
  }
}

async function restoreOptions() {
  const savedSettings = await browser.storage.local.get(
    Object.values(USER_SETTINGS_OPTIONS)
  );
  // console.log('savedSettings');
  // console.log(savedSettings);
  const actualSettings = {
    ...USER_SETTINGS_DEFAULT_VALUE,
    ...savedSettings,
  }
  // console.log('actualSettings');
  // console.log(actualSettings);

  let optionId = USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS;
  let domId = `#${optionId}`
  let element = document.querySelector(domId)
  element.checked = actualSettings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = 'CLEAR_URL_LIST';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = formatTargetList().join('\n');

  optionId = USER_SETTINGS_OPTIONS.SHOW_BOOKMARK_TITLE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = actualSettings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = actualSettings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  optionId = USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = actualSettings[optionId];
  element.addEventListener('change', makeSaveSelectHandler(optionId) );

  optionId = USER_SETTINGS_OPTIONS.ADD_BOOKMARK;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = actualSettings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );
}

document.addEventListener('DOMContentLoaded', restoreOptions);