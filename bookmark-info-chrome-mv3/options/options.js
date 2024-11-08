
// TODO-DOUBLE remove duplication in EXTENSION_COMMAND_ID: command-id.js and options.js
const EXTENSION_COMMAND_ID = {
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
  OPTIONS_ASKS_SAVE: 'OPTIONS_ASKS_SAVE',
}

const wait = ms => new Promise(res => setTimeout(res, ms));

async function delegateSaveOptions(updateObj) {
  await chrome.runtime.sendMessage({
    command: EXTENSION_COMMAND_ID.OPTIONS_ASKS_SAVE,
    updateObj,
  });
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
      await delegateSaveOptions({
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
      await delegateSaveOptions({
        [optionId]: +element.value
      })  
    }
  }
}

// eslint-disable-next-line no-unused-vars
function makeSaveSelectHandler(optionId) {
  return async function saveSelectHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)
  
    if (element) {
      await delegateSaveOptions({
        [optionId]: +element.value
      })  
    }
  }
}

function restoreOptions(settings) {
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
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

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
      command: EXTENSION_COMMAND_ID.OPTIONS_ASKS_FLAT_BOOKMARKS,
    });
    const text = 'Operation started'
    const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
    value.textContent = text;

    await wait(50)
  });

  optionId = STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];

  optionId = STORAGE_KEY.ADD_BOOKMARK_HIGHLIGHT_LAST;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );
}

let clearUrlTargetList
let STORAGE_KEY

chrome.runtime.onMessage.addListener(async (message) => {
  // console.log('onMessage', message)
  switch (message?.command) {
    case EXTENSION_COMMAND_ID.DATA_FOR_OPTIONS: {
      // console.log('option in DATA_FOR_OPTIONS')
      clearUrlTargetList = message.clearUrlTargetList
      STORAGE_KEY = message.STORAGE_KEY
      restoreOptions(message.settings)
      break
    }
    case EXTENSION_COMMAND_ID.FLAT_BOOKMARKS_RESULT: {
      // console.log('option in FLAT_BOOKMARKS_RESULT', message.success)
      const text = message.success 
        ? 'Operation completed successfully'
        : 'Operation failed'
      const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
      // TODO it is not updated in form for firefox. chrome is ok
      //  message has received, element is found
      //  may be debug mode
      value.textContent = text;

      const optionId = STORAGE_KEY.FORCE_FLAT_FOLDER_STRUCTURE;
      const domId = `#${optionId}`
      const element = document.querySelector(domId)
      element.checked = element.checked || !!message.success;
    
      await wait(50)

      break
    }
  }
})
//document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.runtime.sendMessage({
    command: EXTENSION_COMMAND_ID.OPTIONS_ASKS_DATA,
  });
});
