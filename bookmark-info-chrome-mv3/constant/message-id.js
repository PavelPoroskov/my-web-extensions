export const EXTENSION_MSG_ID = {
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and content-scripts.js
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  ADD_BOOKMARK_FOLDER_BY_ID: 'ADD_BOOKMARK_FOLDER_BY_ID',
  ADD_BOOKMARK_FOLDER_BY_NAME: 'ADD_BOOKMARK_FOLDER_BY_NAME',
  FIX_TAG: 'FIX_TAG',
  UNFIX_TAG: 'UNFIX_TAG',
  PAGE_EVENT: 'PAGE_EVENT',
  TAB_IS_READY: 'TAB_IS_READY',
  SHOW_TAG_LIST: 'SHOW_TAG_LIST',
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and options.js
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
  OPTIONS_ASKS_SAVE: 'OPTIONS_ASKS_SAVE',
  UPDATE_AVAILABLE_ROWS: 'UPDATE_AVAILABLE_ROWS',
  RESULT_AUTHOR: 'RESULT_AUTHOR',
}

// TODO remove duplication in CONTENT_SCRIPT_MSG_ID: message-id.js and content-scripts.js
export const CONTENT_SCRIPT_MSG_ID = {
  BOOKMARK_INFO: 'BOOKMARK_INFO',
  HISTORY_INFO: 'HISTORY_INFO',
  TAGS_INFO: 'TAGS_INFO',
  CHANGE_URL: 'CHANGE_URL',
  TOGGLE_YOUTUBE_HEADER: 'TOGGLE_YOUTUBE_HEADER',
  GET_USER_INPUT: 'GET_USER_INPUT',
  GET_SELECTION: 'GET_SELECTION',
  REPLACE_URL: 'REPLACE_URL',
  SEND_ME_AUTHOR: 'SEND_ME_AUTHOR',
}
