// TODO-DOUBLE remove duplication in EXTENSION_MSG_ID: message-id.js and options.js
const EXTENSION_MSG_ID = {
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
  OPTIONS_ASKS_SAVE: 'OPTIONS_ASKS_SAVE',
}

const wait = ms => new Promise(res => setTimeout(res, ms));

async function delegateSaveOptions(updateObj) {
  await browser.runtime.sendMessage({
    command: EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE,
    updateObj,
  });
}

function formatTargetList (clearUrlTargetList) { 
  return clearUrlTargetList.toSorted().map(
    ({ hostname, removeAllSearchParamForPath }) => `${hostname}{${(removeAllSearchParamForPath || []).toSorted().join(',')}}`
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
  let optionId = USER_OPTION.CLEAR_URL_ON_PAGE_OPEN;
  let domId = `#${optionId}`
  let element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = 'CLEAR_URL_LIST';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = formatTargetList(clearUrlTargetList).join('\n');

  optionId = USER_OPTION.SHOW_BOOKMARK_TITLE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.SHOW_PREVIOUS_VISIT;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.TAG_LIST_USE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.TAG_LIST_LIST_LENGTH;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  optionId = USER_OPTION.TAG_LIST_TAG_LENGTH;
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
    await browser.runtime.sendMessage({
      command: EXTENSION_MSG_ID.OPTIONS_ASKS_FLAT_BOOKMARKS,
    });
    const text = 'Operation started'
    const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
    value.textContent = text;

    await wait(50)
  });

  optionId = USER_OPTION.USE_FLAT_FOLDER_STRUCTURE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];

  optionId = USER_OPTION.TAG_LIST_HIGHLIGHT_LAST;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  optionId = USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.HIDE_PAGE_HEADER_FOR_YOUTUBE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );
}

let clearUrlTargetList
let USER_OPTION

browser.runtime.onMessage.addListener(async (message) => {
  // console.log('onMessage', message)
  switch (message?.command) {
    case EXTENSION_MSG_ID.DATA_FOR_OPTIONS: {
      // console.log('option in DATA_FOR_OPTIONS')
      clearUrlTargetList = message.clearUrlTargetList
      USER_OPTION = message.USER_OPTION
      restoreOptions(message.settings)
      break
    }
    case EXTENSION_MSG_ID.FLAT_BOOKMARKS_RESULT: {
      // console.log('option in FLAT_BOOKMARKS_RESULT', message.success)
      const text = message.success 
        ? 'Operation completed successfully'
        : 'Operation failed'
      const value = document.querySelector('#FLAT_BOOKMARKS_RESULT');
      // TODO it is not updated in form for firefox. chrome is ok
      //  message has received, element is found
      //  may be debug mode
      value.textContent = text;

      const optionId = USER_OPTION.USE_FLAT_FOLDER_STRUCTURE;
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
  await browser.runtime.sendMessage({
    command: EXTENSION_MSG_ID.OPTIONS_ASKS_DATA,
  });
});