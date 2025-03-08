
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
  await chrome.runtime.sendMessage({
    command: EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE,
    updateObj,
  });
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

function makeSaveSelectHandler(optionId) {
  return async function saveSelectHandler(event) {
    event.preventDefault();

    const element = document.querySelector(`#${optionId}`)

    if (element) {
      await delegateSaveOptions({
        [optionId]: element.value
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
  element.value = HOST_LIST_FOR_PAGE_OPTIONS.join('\n');

  optionId = USER_OPTION.SHOW_BOOKMARK_TITLE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.USE_PARTIAL_URL_SEARCH;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.URL_SHOW_AUTHOR_TAGS;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.SHOW_PREVIOUS_VISIT;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.FONT_SIZE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('input', makeSaveInputHandler(optionId) );

  const valueFS = document.querySelector(`#${optionId}-VALUE`);
  valueFS.textContent = element.value;
  element.addEventListener("input", (event) => {
    valueFS.textContent = event.target.value;
  });

  optionId = USER_OPTION.USE_TAG_LIST;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

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

  optionId = USER_OPTION.TAG_LIST_OPEN_MODE;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('change', makeSaveSelectHandler(optionId) );

  optionId = USER_OPTION.TAG_LIST_PINNED_TAGS_POSITION;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.value = settings[optionId];
  element.addEventListener('change', makeSaveSelectHandler(optionId) );

  optionId = USER_OPTION.TAG_LIST_HIGHLIGHT_ALPHABET;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = 'FLAT_BOOKMARKS';
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({
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

  optionId = USER_OPTION.YOUTUBE_HIDE_PAGE_HEADER;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );

  optionId = USER_OPTION.YOUTUBE_REDIRECT_CHANNEL_TO_VIDEOS;
  domId = `#${optionId}`
  element = document.querySelector(domId)
  element.checked = settings[optionId];
  element.addEventListener('change', makeSaveCheckboxHandler(optionId) );
}

let HOST_LIST_FOR_PAGE_OPTIONS
let USER_OPTION

chrome.runtime.onMessage.addListener(async (message) => {
  // console.log('onMessage', message)
  switch (message?.command) {
    case EXTENSION_MSG_ID.DATA_FOR_OPTIONS: {
      // console.log('option in DATA_FOR_OPTIONS')
      HOST_LIST_FOR_PAGE_OPTIONS = message.HOST_LIST_FOR_PAGE_OPTIONS
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
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.runtime.sendMessage({
    command: EXTENSION_MSG_ID.OPTIONS_ASKS_DATA,
  });
});
