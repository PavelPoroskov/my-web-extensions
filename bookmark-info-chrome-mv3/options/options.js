const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
  SHOW_PATH_LAYERS: 'SHOW_PATH_LAYERS',
  SHOW_PREVIOUS_VISIT: 'SHOW_PREVIOUS_VISIT',
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
}

function makeSaveCheckboxHandler(optionId) {
  return async function saveCheckboxHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await chrome.storage.local.set({
        [optionId]: element.checked
      })  
      await chrome.runtime.sendMessage({
        command: "optionsChanged",
      });  
    }
  }
}

function makeSaveInputHandler(optionId) {
  return async function saveInputHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await chrome.storage.local.set({
        // [optionId]: +event.target.value
        [optionId]: +element.value
      })  
      await chrome.runtime.sendMessage({
        command: "optionsChanged",
      });  
    }
  }
}

function makeSaveSelectHandler(optionId) {
  return async function saveSelectHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await chrome.storage.local.set({
        // [optionId]: +event.target.value
        [optionId]: +element.value
      })  
      await chrome.runtime.sendMessage({
        command: "optionsChanged",
        optionId,
      });  
    }
  }
}

async function restoreOptions() {
  const savedSettings = await chrome.storage.local.get(
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
}

document.addEventListener('DOMContentLoaded', restoreOptions);
