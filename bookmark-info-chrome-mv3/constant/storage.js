export const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

export const STORAGE_KEY_META = {
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
    default: false,
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
  ADD_BOOKMARK_HIGHLIGHT_LAST: {
    storageKey: 'ADD_BOOKMARK_HIGHLIGHT_LAST', 
    default: 5,
  },
  ADD_BOOKMARK_SESSION_STARTED: {
    storageKey: 'ADD_BOOKMARK_SESSION_STARTED',
    storage: STORAGE_TYPE.SESSION,
    default: false,
  },
  ADD_BOOKMARK_RECENT_MAP: {
    storageKey: 'ADD_BOOKMARK_RECENT_MAP',
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
  FORCE_FLAT_FOLDER_STRUCTURE: {
    storageKey: 'FORCE_FLAT_FOLDER_STRUCTURE', 
    default: false,
  },
}

export const STORAGE_KEY = Object.fromEntries(
  Object.keys(STORAGE_KEY_META).map((key) => [key, key])
)

export const ADD_BOOKMARK_LIST_MAX = 50


