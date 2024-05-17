const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
}

const o = USER_SETTINGS_OPTIONS
const USER_SETTINGS_DEFAULT_VALUE = {
  [o.CLEAR_URL_FROM_QUERY_PARAMS]: true,
}

function makeSaveCheckboxHandler(optionId) {
  return async function saveCheckboxHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await browser.storage.local.set({
        [optionId]: element.checked
      })  
      await browser.runtime.sendMessage({
        command: "optionsChanged",
      });  
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
}

document.addEventListener('DOMContentLoaded', restoreOptions);