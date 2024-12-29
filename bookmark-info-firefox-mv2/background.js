const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}

const BROWSER_SPECIFIC_OPTIONS = {
  MENU_CONTEXT: {
    [BROWSER_OPTIONS.CHROME]: ['all'],
    [BROWSER_OPTIONS.FIREFOX]: ['all','tab']
  },
}
// TODO remove duplication BROWSER in browser-specific.js and content-scripts.js
const BROWSER = BROWSER_OPTIONS.FIREFOX;
const IS_BROWSER_CHROME = BROWSER === BROWSER_OPTIONS.CHROME;
const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;

const BROWSER_SPECIFIC = Object.fromEntries(
  Object.entries(BROWSER_SPECIFIC_OPTIONS)
    .map(([option, obj]) => [option, obj[BROWSER]])
);
const EXTENSION_MSG_ID = {
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and content-scripts.js
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  ADD_BOOKMARK_FOLDER_BY_NAME: 'ADD_BOOKMARK_FOLDER_BY_NAME',
  FIX_TAG: 'FIX_TAG',
  UNFIX_TAG: 'UNFIX_TAG',
  TAB_IS_READY: 'TAB_IS_READY',
  SHOW_TAG_LIST: 'SHOW_TAG_LIST',
  ADD_RECENT_TAG: 'ADD_RECENT_TAG',
  // TODO remove duplication in EXTENSION_MSG_ID: message-id.js and options.js
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
  OPTIONS_ASKS_SAVE: 'OPTIONS_ASKS_SAVE',
}

// TODO remove duplication in CONTENT_SCRIPT_MSG_ID: message-id.js and content-scripts.js
const CONTENT_SCRIPT_MSG_ID = {
  BOOKMARK_INFO: 'BOOKMARK_INFO',
  HISTORY_INFO: 'HISTORY_INFO',
  TAGS_INFO: 'TAGS_INFO',
  CHANGE_URL: 'CHANGE_URL',
  TOGGLE_YOUTUBE_HEADER: 'TOGGLE_YOUTUBE_HEADER',
  GET_USER_INPUT: 'GET_USER_INPUT',
  GET_SELECTION: 'GET_SELECTION',
  REPLACE_URL: 'REPLACE_URL',
}
const BASE_ID = 'BKM_INF';

const CONTEXT_MENU_CMD_ID = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  CLEAR_URL: `${BASE_ID}_CLEAR_URL`,
  TOGGLE_YOUTUBE_HEADER: `${BASE_ID}_TOGGLE_YOUTUBE_HEADER`,
  ADD_BOOKMARK_FROM_SELECTION_MENU: `${BASE_ID}_ADD_BOOKMARK_FROM_SELECTION_MENU`,
  ADD_BOOKMARK_FROM_INPUT_MENU: `${BASE_ID}_ADD_BOOKMARK_FROM_INPUT_MENU`,
  GET_URL_FROM_URL: `${BASE_ID}_GET_URL_FROM_URL`,
};

const KEYBOARD_CMD_ID = {
  ADD_BOOKMARK_FROM_INPUT_KBD: `ADD_BOOKMARK_FROM_INPUT_KBD`,
  ADD_BOOKMARK_FROM_SELECTION_KBD: `ADD_BOOKMARK_FROM_SELECTION_KBD`,
};
const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};

const logModuleList = [
  // 'bookmarks.controller',
  // 'browserStartTime',
  // 'cache',
  // 'clearUrlInActiveTab',
  // 'commands.controller',
  // 'content-script.api',
  // 'contextMenu.controller',
  // 'debounceQueue',
  // 'extensionSettings',
  // 'folder.api',
  // 'get-bookmarks.api.js',
  // 'getUrlFromUrl',
  // 'history.api',
  // 'incoming-message',
  // 'init-extension',
  // 'memo',
  // 'recent.api',
  // 'runtime.controller',
  // 'storage.api',
  // 'storage.controller',
  // 'tabs.api',
  // 'tabs.controller',
  // 'url-search.api',
  // 'url.api.config',
  // 'windows.controller',
]
const logModuleMap = Object.fromEntries(
  logModuleList.map((moduleKey) => [moduleKey, true])
)
const makeLogWithTime = () => {
  let startTime;
  let prevLogTime;

  return function () {
    if (!startTime) {
      startTime = Date.now();
      prevLogTime = startTime;
    }

    const newLogTime = Date.now();
    // const dif = (newLogTime - prevLogTime)/1000;
    const dif = (newLogTime - prevLogTime);
    prevLogTime = newLogTime;

    const ar = Array.from(arguments);
    ar.unshift(`+${dif}`);
    console.log(...ar);
  }
}

const logWithTime = makeLogWithTime();

// eslint-disable-next-line no-unused-vars
const makeLogWithPrefixAndTime = (prefix = '') => {
  return function () {
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

const makeLogFunction = ({ module }) => {

  const isLogging = logModuleMap[module] || false

  if (!isLogging) {
    return () => {}
  }

  let prefix = module;
  if (prefix.endsWith('.js')) {
    prefix = prefix.slice(0, -3)
  }

  return function () {
    const ar = Array.from(arguments);
    ar.unshift(prefix);
    console.log(...ar);
  }
}
class ExtraMap extends Map {
  sum(key, addValue) {
    super.set(key, (super.get(key) || 0) + addValue)
  }
  update(key, updateObj) {
    super.set(key, {
      ...super.get(key),
      ...updateObj,
    })
  }
  concat(key, inItem) {
    const item = inItem === undefined ? [] : inItem
    // item -- single item or array
    const ar = super.get(key) || []
    super.set(key, ar.concat(item))
  }
}
const logC = makeLogFunction({ module: 'cache' })

class CacheWithLimit {
  constructor ({ name='cache', size = 100 }) {
    this.cache = new Map();
    this.LIMIT = size;
    this.name = name;
  }
  removeStale () {
    if (this.LIMIT < this.cache.size) {
      let deleteCount = this.cache.size - this.LIMIT;
      const keyToDelete = [];
      
      // Map.key() returns keys in insertion order
      for (const key of this.cache.keys()) {
        keyToDelete.push(key);
        deleteCount -= 1;
        if (deleteCount <= 0) {
          break;
        }
      }
  
      for (const key of keyToDelete) {
        this.cache.delete(key);
      }
    }
  }

  add (key,value) {
    this.cache.set(key, value);
    logC(`   ${this.name}.add: ${key}`, value);
    
    this.removeStale();
  }
  
  get(key) {
    const value = this.cache.get(key);
    logC(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logC(`   ${this.name}.delete: ${key}`);
  }
  
  clear() {
    this.cache.clear();
    logC(`   ${this.name}.clear()`);
  }

  has(key) {
    return this.cache.has(key);
  }

  print() {
    logC(this.cache);
  }
}
const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const USER_OPTION_META = {
  CLEAR_URL_ON_PAGE_OPEN: {
    default: true,
  },
  SHOW_PREVIOUS_VISIT: {
    default: false,
  },
  SHOW_BOOKMARK_TITLE: {
    default: false,
  },
  TAG_LIST_USE: {
    default: true,
  },
  TAG_LIST_LIST_LENGTH: {
    default: 35,
  },
  TAG_LIST_TAG_LENGTH: {
    default: 15,
  },
  TAG_LIST_HIGHLIGHT_LAST: {
    default: 7,
  },
  USE_FLAT_FOLDER_STRUCTURE: {
    default: false,
  },
  HIDE_PAGE_HEADER_FOR_YOUTUBE: {
    default: false,
  },
  HIDE_TAG_HEADER_ON_PRINTING: {
    default: false,
  },
  USE_PARTIAL_URL_SEARCH: {
    default: false,
  },
}

const INTERNAL_VALUES_META = {
  TAG_LIST_IS_OPEN: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_SESSION_STARTED: {
    default: false,
    storage: STORAGE_TYPE.SESSION,
  },
  TAG_LIST_RECENT_MAP: {
    default: {},
  },
  TAG_LIST_FIXED_MAP: {
    default: {},
  },
  BROWSER_START_TIME: {
    storage: STORAGE_TYPE.SESSION,
  },
}

const userOptionSet = new Set(Object.keys(USER_OPTION_META))
const internalValuesSet = new Set(Object.keys(INTERNAL_VALUES_META))
const intersectSet = userOptionSet.intersection(internalValuesSet)

if (intersectSet.size > 0) {
  throw new Error(`User options and internal keys has intersection: ${Array.from(intersectSet.keys())}`)
}

// it is used inside getOptions()/setOptions() only
const STORAGE_KEY_META = Object.fromEntries(
  Object.entries({ ...USER_OPTION_META, ...INTERNAL_VALUES_META })
    .map(([key, obj]) => [key, {
      ...obj,
      storageKey: obj.storageKey || key,
      storage: obj.storage || STORAGE_TYPE.LOCAL
    }])
)

// it is used to read one option value in program code
const USER_OPTION = Object.fromEntries(
  Object.keys(USER_OPTION_META).map((key) => [key, key])
)
// it is used in extensionSettings to read ALL user options from storage to program
const USER_OPTION_KEY_LIST = Object.keys(USER_OPTION_META)

// it is used in storage controller to detect user options was changed
const USER_OPTION_STORAGE_KEY_LIST = USER_OPTION_KEY_LIST.map((key) => STORAGE_KEY_META[key].storageKey)

const INTERNAL_VALUES = Object.fromEntries(
  Object.keys(INTERNAL_VALUES_META).map((key) => [key, key])
)

// rename ADD_BOOKMARK_LIST_MAX -> TAG_LIST_MAX_LIST_LENGTH
const TAG_LIST_MAX_LIST_LENGTH = 50
const logSA = makeLogFunction({ module: 'storage.api' })

async function setOptions(obj) {
  const entryList = Object.entries(obj)
    .map(([key, value]) => ({
      key, 
      storage: STORAGE_KEY_META[key].storage,
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

  logSA('setOptions localObj', localObj)
  logSA('setOptions sessionObj', sessionObj)
  await Promise.all([
    localList.length > 0 && browser.storage.local.set(localObj),
    sessionList.length > 0 && browser.storage.session.set(sessionObj),
  ])
}

async function getOptions(keyList) {
  const inKeyList = Array.isArray(keyList) ? keyList : [keyList]

  const entryList = inKeyList
    .map((key) => ({
      key, 
      storage: STORAGE_KEY_META[key].storage,
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
      ? browser.storage.local.get(
        localList.map((key) => STORAGE_KEY_META[key].storageKey)
      )
      : {},
    sessionList.length > 0 
      ? browser.storage.session.get(
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
const logM = makeLogFunction({ module: 'memo' })

const memo = {
  previousTabId: '',
  activeTabId: '',
  activeTabUrl: '',

  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  // cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
}

logM('IMPORT END', 'memo.js', new Date().toISOString())
const logES = makeLogFunction({ module: 'extensionSettings' })

class ExtensionSettings {
  _isActual = false
  _settings = {}
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async get() {
    await this.promise

    return { ...this._settings }
  }
  invalidate () {
    this._isActual = false
  }
  async restoreFromStorage() {
    logES('readSavedSettings START')
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await getOptions(USER_OPTION_KEY_LIST)
      .then((result) => {
        this._settings = result
        this.fnResolve()
      })
      .catch(this.fnReject);
  
    logES('readSavedSettings')
    logES(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  
  }

  async update(updateObj) {
    Object.entries(updateObj).forEach(([ket, value]) => {
      this._settings[ket] = value
    })
    
    await setOptions(updateObj)
  }
}

const extensionSettings = new ExtensionSettings()
const logBST = makeLogFunction({ module: 'browserStartTime' })

class BrowserStartTime {
  _isActual = false
  startTime
  promise
  fnResolve
  fnReject

  isActual() {
    return this._isActual
  }
  async getStartTime() {
    const storedSession = await getOptions(INTERNAL_VALUES.BROWSER_START_TIME)
    logBST('storedSession', storedSession)

    let result

    if (storedSession[INTERNAL_VALUES.BROWSER_START_TIME]) {
      result = storedSession[INTERNAL_VALUES.BROWSER_START_TIME]
    } else {
      // I get start for service-worker now.
      //    It is correct if this web-extension was installed in the previous browser session
      // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
      //  tab with minimal tabId
      result = performance.timeOrigin
      await setOptions({
        [INTERNAL_VALUES.BROWSER_START_TIME]: this._profileStartTimeMS
      })
    }

    return result
  }
  async init() {
    this._isActual = true

    this.promise = new Promise((fnResolve, fnReject) => {
      this.fnResolve = fnResolve;
      this.fnReject = fnReject;
    });

    await this.getStartTime()
      .then((result) => {
        this.startTime = result

        this.fnResolve()
      })
      .catch(this.fnReject)

      logBST('profileStartTimeMS', new Date(this.startTime).toISOString())
  }
  async get() {
    await this.promise

    return this.startTime
  }
}

const browserStartTime = new BrowserStartTime()
// ignore create from api to detect create from user
class IgnoreBkmControllerApiActionSet {
  constructor() {
    this._innerSet = new Set();
  }
  addIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    this._innerSet.add(innerKey)
  }
  hasIgnoreCreate({ parentId, url, title }) {
    const innerKey = url
      ? `create#${parentId}#${url}`
      : `create#${parentId}#${title}`

    const isHas = this._innerSet.has(innerKey)
    if (isHas) {
      this._innerSet.delete(innerKey)
    }

    return isHas
  }
  addIgnoreMove(bkmId) {
    const innerKey = `move#${bkmId}`

    this._innerSet.add(innerKey)
  }
  hasIgnoreMove(bkmId) {
    const innerKey = `move#${bkmId}`

    const isHas = this._innerSet.has(innerKey)
    if (isHas) {
      this._innerSet.delete(innerKey)
    }

    return isHas
  }
}

const ignoreBkmControllerApiActionSet = new IgnoreBkmControllerApiActionSet()
const supportedProtocols = ["https:", "http:"];

function isSupportedProtocol(urlString) {
  try {
    const url = new URL(urlString);
    
    return supportedProtocols.includes(url.protocol);
  // eslint-disable-next-line no-unused-vars
  } catch (_er) {
    return false;
  }
}

function debounce(func, timeout = 300){
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(
      () => {
        func.apply(this, args);
      },
      timeout,
    );
  };
}

const isNotEmptyArray = (ar) => Array.isArray(ar) && ar.length > 0
let lastCreatedBkmParentId
let lastCreatedBkmUrl

async function createBookmarkWithApi({
  index,
  parentId,
  title,
  url
}) {
  lastCreatedBkmParentId = parentId
  lastCreatedBkmUrl = url

  return await browser.bookmarks.create({
    index,
    parentId,
    title,
    url
  })
}

function isBookmarkCreatedWithApi({ parentId, url }) {
  return parentId == lastCreatedBkmParentId && url == lastCreatedBkmUrl
}

async function createBookmarkIgnoreInController({
  title,
  url,
  parentId,
  index,
}) {
  const options = { url, parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  return await browser.bookmarks.create(options)
}

async function createFolderIgnoreInController({
  title,
  parentId,
  index,
}) {
  const options = { parentId, title }
  if (index != undefined) {
    options.index = index
  }

  ignoreBkmControllerApiActionSet.addIgnoreCreate(options)

  return await browser.bookmarks.create(options)
}

async function moveBookmarkIgnoreInController({ id, parentId, index }) {
  const options = {}
  if (parentId != undefined) {
    options.parentId = parentId
  }
  if (index != undefined) {
    options.index = index
  }
  if (Object.keys(options).length == 0) {
    return
  }

  ignoreBkmControllerApiActionSet.addIgnoreMove(id)

  return await browser.bookmarks.move(id, options)
}
const BOOKMARKS_BAR_FOLDER_ID = IS_BROWSER_FIREFOX ? 'toolbar_____' : '1'
const BOOKMARKS_MENU_FOLDER_ID = IS_BROWSER_FIREFOX ? 'menu________' : undefined
const OTHER_BOOKMARKS_FOLDER_ID = IS_BROWSER_FIREFOX ? 'unfiled_____' : '2'


async function getOrCreateFolderByTitleInRoot(title) {
  const nodeList = await browser.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundItem) {
    return foundItem.id
  }

  const folder = {
    parentId: OTHER_BOOKMARKS_FOLDER_ID,
    title
  }
  const newNode = await createFolderIgnoreInController(folder)

  return newNode.id
}

async function getFolderByTitleInRoot(title) {
  const nodeList = await browser.bookmarks.getChildren(OTHER_BOOKMARKS_FOLDER_ID)
  const foundItem = nodeList.find((node) => !node.url && node.title === title)

  if (foundItem) {
    return foundItem.id
  }
}

function memoize(fnGetValue) {
  let isValueWasGet = false
  let value

  return async function () {
    if (isValueWasGet) {
      return value
    }

    isValueWasGet = true

    return value = fnGetValue()
  }
}

const UNCLASSIFIED_TITLE = 'zz-bookmark-info--unclassified'

const getOrCreateUnclassifiedFolderId = async () => getOrCreateFolderByTitleInRoot(UNCLASSIFIED_TITLE)
const getUnclassifiedFolderId = memoize(async () => getFolderByTitleInRoot(UNCLASSIFIED_TITLE))

const isDescriptiveFolderTitle = (title) => !!title
  && !(
    title.startsWith('New folder')
    || title.startsWith('[Folder Name]')
    || title.startsWith('New Folder')
    || title.startsWith('(to title)')
  )
const logRA = makeLogFunction({ module: 'recent.api' })

async function getRecentList(nItems) {
  logRA('getRecentList() 00', nItems)
  const list = await browser.bookmarks.getRecent(nItems);

  const folderList = list
    .filter(({ url }) => !url)

  const folderByIdMap = Object.fromEntries(
    folderList.map(({ id, title, dateAdded }) => [
      id,
      {
        title,
        dateAdded,
        isSourceFolder: true,
      }
    ])
  )

  const bookmarkList = list.filter(({ url }) => url)
  bookmarkList.forEach(({ parentId, dateAdded }) => {
    folderByIdMap[parentId] = {
      ...folderByIdMap[parentId],
      dateAdded: Math.max(folderByIdMap[parentId]?.dateAdded || 0, dateAdded)
    }
  })

  const unknownIdList = Object.entries(folderByIdMap)
    .filter(([, { isSourceFolder }]) => !isSourceFolder)
    .map(([id]) => id)

  if (unknownIdList.length > 0) {
    const unknownFolderList = await browser.bookmarks.get(unknownIdList)
    unknownFolderList.forEach(({ id, title }) => {
      folderByIdMap[id].title = title
    })
  }

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
    .filter(({ title }) => isDescriptiveFolderTitle(title))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
}

async function getRecentTagObj(nItems) {
  let list = await getRecentList(nItems * 4)

  if (0 < list.length && list.length < nItems) {
    list = await getRecentList(nItems * 10)
  }

  return Object.fromEntries(
    list
      .slice(0, nItems)
      .map(({ parentId, title, dateAdded }) => [parentId, { title, dateAdded }])
  )
}

async function filterFolders(idList, isFlatStructure) {
  if (idList.length === 0) {
    return []
  }

  const folderList = await browser.bookmarks.get(idList)
  let filteredFolderList = folderList
    .filter(Boolean)
    .filter(({ title }) => !!title)
    .filter(({ title }) => isDescriptiveFolderTitle(title))

  // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
  if (isFlatStructure) {
    const unclassifiedFolderId = await getUnclassifiedFolderId()

    filteredFolderList = filteredFolderList
      .filter(
        ({ parentId }) => parentId === OTHER_BOOKMARKS_FOLDER_ID || parentId === BOOKMARKS_BAR_FOLDER_ID
      )
      .filter(
        ({ id }) => id !== unclassifiedFolderId
      )
  }

  return filteredFolderList
}

async function filterRecentTagObj(obj = {}, isFlatStructure) {
  const filteredFolderList = await filterFolders(Object.keys(obj), isFlatStructure)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [
      id, 
      {
        title, 
        dateAdded: obj[id].dateAdded,
      }
    ])
  )
}

async function filterFixedTagObj(obj = {}, isFlatStructure) {
  const filteredFolderList = await filterFolders(Object.keys(obj), isFlatStructure)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [id, title])
  )
}
class TagList {
  isTagListAvailable = true
  _recentTagObj = {}
  _fixedTagObj = {}
  _tagList = []
  LIST_LIMIT
  USE_FLAT_FOLDER_STRUCTURE
  HIGHLIGHT_LAST

  changeCount = 0
  changeProcessedCount = -1

  get list() {
    if (this.changeProcessedCount !== this.changeCount) {
      this.changeProcessedCount = this.changeCount
      this._tagList = this.refillList()
    }

    return this._tagList
  }
  markUpdates() {
    this.changeCount += 1
  }

  async readFromStorage() {
    const settings = await extensionSettings.get()

    if (!settings[USER_OPTION.TAG_LIST_USE]) {
      return
    }

    this.LIST_LIMIT = settings[USER_OPTION.TAG_LIST_LIST_LENGTH]
    this.USE_FLAT_FOLDER_STRUCTURE = settings[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]
    this.HIGHLIGHT_LAST = settings[USER_OPTION.TAG_LIST_HIGHLIGHT_LAST]

    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_SESSION_STARTED,
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
    ]);

    let actualRecentTagObj = {}
    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      actualRecentTagObj = await getRecentTagObj(TAG_LIST_MAX_LIST_LENGTH)
    }

    this._recentTagObj = {
      ...savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP],
      ...actualRecentTagObj,
    }
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP]

    if (!savedObj[INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]) {
      const isFlatStructure = this.USE_FLAT_FOLDER_STRUCTURE
      this._recentTagObj = await filterRecentTagObj(this._recentTagObj, isFlatStructure)
      this._fixedTagObj = await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_SESSION_STARTED]: true,
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
      })
    }

    this.markUpdates()
  }
  async filterTagListForFlatFolderStructure() {
    const savedObj = await getOptions([
      INTERNAL_VALUES.TAG_LIST_RECENT_MAP,
      INTERNAL_VALUES.TAG_LIST_FIXED_MAP,
    ]);
    this._recentTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_RECENT_MAP]
    this._fixedTagObj = savedObj[INTERNAL_VALUES.TAG_LIST_FIXED_MAP]

    const isFlatStructure = true
    // console.log('filterTagListForFlatFolderStructure ', this._fixedTagObj)
    this._recentTagObj =  await filterRecentTagObj(this._recentTagObj, isFlatStructure)
    this._fixedTagObj =  await filterFixedTagObj(this._fixedTagObj, isFlatStructure)
    // console.log('filterTagListForFlatFolderStructure, after filter', this._fixedTagObj)
    this.markUpdates()

    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj,
    })
  }
  refillList() {
    const recentTaLimit = Math.max(
      this.LIST_LIMIT - Object.keys(this._fixedTagObj).length,
      0
    )

    const recentTagList = Object.entries(this._recentTagObj)
      .filter(([parentId]) => !(parentId in this._fixedTagObj))
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, recentTaLimit)

    const lastTagList = Object.entries(this._recentTagObj)
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, this.HIGHLIGHT_LAST)
    const lastTagSet = new Set(
      lastTagList.map(({ parentId }) => parentId)
    )
    
    const fullList = [].concat(
      recentTagList
        .map(({ parentId, title }) => ({ parentId, title, isFixed: false })),
      Object.entries(this._fixedTagObj)
        .map(([parentId, title]) => ({
          parentId,
          // title: this._recentTagObj[parentId]?.title || title,
          title,
          isFixed: true,
        }))
    )
      .map((item) => ({ ...item, isLast: lastTagSet.has(item.parentId) }))

    return fullList
      .filter(({ title }) => !!title)
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  }
  async blockTagList(boolValue) {
    this.isTagListAvailable = !boolValue
  }

  async addRecentTagFromFolder(folderNode) {
    if (!this.isTagListAvailable) {
      return
    }

    // FEATURE.FIX: when use flat folder structure, only fist level folder get to recent list
    if (this.USE_FLAT_FOLDER_STRUCTURE) {
      // if (!(newFolder.parentId === OTHER_BOOKMARKS_FOLDER_ID)) {
      //   return
      // }

      const unclassifiedFolderId = await getUnclassifiedFolderId()
      if (unclassifiedFolderId && folderNode.id === unclassifiedFolderId) {
        return
      }
    }
  
    if (!isDescriptiveFolderTitle(folderNode.title)) {
      return
    }

    this._recentTagObj[folderNode.id] = {
      dateAdded: Date.now(),
      title: folderNode.title
    }

    let fixedTagUpdate
    if (folderNode.id in this._fixedTagObj) {
      this._fixedTagObj[folderNode.id] = folderNode.title
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    if (TAG_LIST_MAX_LIST_LENGTH + 10 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(TAG_LIST_MAX_LIST_LENGTH)
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this.markUpdates()
    setOptions({
      [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj,
      ...fixedTagUpdate,
    })
  }
  async addRecentTagFromBkm(bkmNode) {
    if (!this.isTagListAvailable) {
      return
    }

    const parentId = bkmNode?.parentId

    if (parentId) {
      const [folderNode] = await browser.bookmarks.get(parentId)
      await this.addRecentTagFromFolder(folderNode)
    }
  }
  async removeTag(id) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      delete this._fixedTagObj[id] 
      fixedTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      delete this._recentTagObj[id]
      recentTagUpdate = {
        [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this.markUpdates()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  }
  // async updateTag(id, title) {
  //   const isInFixedList = id in this._fixedTagObj
  //   let fixedTagUpdate

  //   if (isInFixedList) {
  //     this._fixedTagObj[id] = title
  //     fixedTagUpdate = {
  //       [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
  //     }
  //   }

  //   const isInRecentList = id in this._recentTagObj
  //   let recentTagUpdate

  //   if (isInRecentList) {
  //     this._recentTagObj[id].title = title
  //     recentTagUpdate = {
  //       [INTERNAL_VALUES.TAG_LIST_RECENT_MAP]: this._recentTagObj
  //     }
  //   }

  //   if (isInFixedList || isInRecentList) {
  //     this.markUpdates()
  //     await setOptions({
  //       ...fixedTagUpdate,
  //       ...recentTagUpdate,
  //     })
  //   }
  // }
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this.markUpdates()
      await setOptions({
        [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
      })
    }
  }
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this.markUpdates()
    await setOptions({
      [INTERNAL_VALUES.TAG_LIST_FIXED_MAP]: this._fixedTagObj
    })
  }
}

const tagList = new TagList()

const logCSA = makeLogFunction({ module: 'content-script.api' })

async function changeUrlInTab({ tabId, url }) {
  logCSA('changeUrlInTab () 00', tabId, url)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.CHANGE_URL,
    url,
  }
  logCSA('changeUrlInTab () sendMessage', tabId, msg)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('changeUrlInTab () IGNORE', err)
    })
}

async function replaceUrlInTab({ tabId, url }) {
  logCSA('replaceUrlInTab () 00', tabId, url)

  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.REPLACE_URL,
    url,
  }
  logCSA('changeUrlInTab () sendMessage', tabId, msg)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('changeUrlInTab () IGNORE', err)
    })
}

async function getSelectionInPage(tabId) {
  logCSA('getSelectionInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_SELECTION,
  }
  logCSA('getSelectionInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('getSelectionInPage () IGNORE', err)
    })
}

async function getUserInputInPage(tabId) {
  logCSA('getUserInputInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.GET_USER_INPUT,
  }
  logCSA('getUserInputInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('getUserInputInPage () IGNORE', err)
    })
}

async function toggleYoutubeHeaderInPage(tabId) {
  logCSA('toggleYoutubeHeaderInPage () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.TOGGLE_YOUTUBE_HEADER,
  }
  logCSA('toggleYoutubeHeaderInPage () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('toggleYoutubeHeaderInPage () IGNORE', err)
    })
}

async function updateBookmarkInfoInPage({ tabId, data }) {
  logCSA('updateBookmarkInfo () 00', tabId)
  const msg = {
    command: CONTENT_SCRIPT_MSG_ID.BOOKMARK_INFO,
    ...data,
  }
  logCSA('updateBookmarkInfo () sendMessage', tabId)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logCSA('updateBookmarkInfo () IGNORE', err)
    })
}
const logUAC = makeLogFunction({ module: 'url.api.config' })

const HOST_URL_SETTINGS = [
  // TODO-NEXT if we clean url on open then we loose check-in, check-out dates
  //    need search bookmark for clean url
  //    strategy01: clean url on open
  //    strategy02: clean url on save
  //    strategy00: don't clear url, default
  // {
  //   hostname: 'airbnb.com',
  //   paths: [
  //     '/rooms/',
  //   ]
  // },
  // {
  //   hostname: 'djinni.co',
  //   removeAllSearchParamForPath: [
  //     '/my/profile/',
  //     '/jobs/',
  //   ]
  // },
  {
    hostname: '9gag.com',
    isHashRequired: true,
  },
  {
    hostname: 'forcoder.net',
    searchParamList: [
      's', // https://forcoder.net/?s=CQRS
    ],
  },
  {
    hostname: 'frontendmasters.com',
    removeAllSearchParamForPath: [
      '/courses/:id/',
    ]
  },
  {
    hostname: 'hh.ru',
    removeAllSearchParamForPath: [
      '/vacancy/:id',
    ],
    searchParamList: [
      ['hhtmFrom'],
      ['hhtmFromLabel'],
      'text',
      'professional_role',
    ],
  },
  {
    hostname: 'imdb.com',
    // removeAllSearchParamForPath: [
    //   '/title/',
    //   '/list/',
    //   '/imdbpicks/',
    //   '/interest/',
    //   '/',
    // ],
    //
    searchParamList: [
      ['ref_'],
      'season', // https://www.imdb.com/title/tt8111088/episodes/?season=3&ref_=tt_eps_sn_3
    ],
  },
  // TODO the same
  // https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4096094176
  // https://www.linkedin.com/jobs/view/4096094176/?alternateChannel=search&refId=WYo23okoaVDvmJkLoaclcg%3D%3D&trackingId=bTIytUCJN%2BDpKjaalPv4gg%3D%3D
  // https://www.linkedin.com/jobs/search/?currentJobId=4096094176&geoId=106686604&origin=JOBS_HOME_LOCATION_AUTOCOMPLETE&refresh=true
  {
    hostname: 'linkedin.com',
    removeAllSearchParamForPath: [
      '/jobs/view/:id/',
      '/posts/:id/'
    ]
  },
  {
    hostname: 'opennet.ru',
    searchParamList: [
      'num',
    ],
  },
  {
    hostname: 'thepiratebay.org',
    searchParamList: [
      'q',
      'id',
    ],
  },
  {
    hostname: 'torrentgalaxy.to',
    searchParamList: [
      'cat',
    ],
  },
  {
    hostname: 'udemy.com',
    removeAllSearchParamForPath: [
      '/course/:id/',
    ]
  },
  {
    hostname: 'www.google.com',
    searchParamList: [
      'q', // https://www.google.com/search?q=react-native
    ],
  },
  {
    hostname: 'mail.google.com',
    isHashRequired: true,
  },
  {
    hostname: 'youtube.com',
    hostnameAliasList: ['youtu.be'],
    searchParamList: [
      'v', // https://www.youtube.com/watch?v=qqqqq
    ],
  },
]

// all articles of author
// https://dev.to/codewithsadee
//  https://dev.to/:author
//
// article
// https://dev.to/codewithsadee/build-deploy-a-stunning-saas-landing-page-with-react-tailwind-51p0
//  https://dev.to/:author/:slug
//
// https://www.youtube.com/watch?v=qqqqq
//  // https://www.youtube.com/watch?v=:slug

// logUAC('HOST_URL_SETTINGS', HOST_URL_SETTINGS.length, HOST_URL_SETTINGS)
const HOST_URL_SETTINGS_LIST = HOST_URL_SETTINGS.map((item) => {
  const searchParamList = item.searchParamList || []
  const importantSearchParamList = searchParamList
    .filter((searchParmName) => typeof searchParmName == 'string')
    .filter(Boolean)

  const removeSearchParamList = searchParamList
    .filter((searchParm) => isNotEmptyArray(searchParm))
    .map((searchParm) => searchParm[0])
    .filter(Boolean)

  return {
    ...item,
    removeSearchParamList,
    importantSearchParamList,
  }
})

// logUAC('HOST_URL_SETTINGS_LIST', HOST_URL_SETTINGS_LIST.length, HOST_URL_SETTINGS_LIST)
const HOST_URL_SETTINGS_MAP = new Map(
  HOST_URL_SETTINGS_LIST.map((item) => [item.hostname, item]),
)

const getHostSettings = (url) => {
  logUAC('getHostSettings 00', url)
  const oUrl = new URL(url);
  const { hostname } = oUrl;
  logUAC('getHostSettings 11', hostname)
  // logUAC('HOST_URL_SETTINGS_MAP', HOST_URL_SETTINGS_MAP)

  let targetHostSettings = HOST_URL_SETTINGS_MAP.get(hostname)
  logUAC('targetHostSettings 22 hostname', targetHostSettings)

  if (!targetHostSettings) {
    const [firstPart, ...restPart] = hostname.split('.')
    logUAC('targetHostSettings 33', firstPart, restPart.join('.'))

    if (firstPart == 'www') {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(restPart.join('.'))
      logUAC('targetHostSettings 44', targetHostSettings)
    } else {
      targetHostSettings = HOST_URL_SETTINGS_MAP.get(`www.${hostname}`)
      logUAC('targetHostSettings 55', targetHostSettings)
    }
  }

  if (!targetHostSettings) {
    const baseDomain = hostname.split('.').slice(-2).join('.')

    targetHostSettings = HOST_URL_SETTINGS_MAP.get(baseDomain)
    logUAC('targetHostSettings 66 baseDomain', baseDomain, targetHostSettings)
  }

  return targetHostSettings
}

const HOST_LIST_FOR_PAGE_OPTIONS = HOST_URL_SETTINGS_LIST
  .toSorted()
  .filter(({ removeSearchParamList, removeAllSearchParamForPath }) => isNotEmptyArray(removeSearchParamList) || isNotEmptyArray(removeAllSearchParamForPath))
  .map(
    ({ hostname, removeAllSearchParamForPath }) => `${hostname}{${(removeAllSearchParamForPath || []).toSorted().join(',')}}`
  )
const logUS = makeLogFunction({ module: 'url-search.api' })

function removeIndexFromPathname(pathname) {
  let list = pathname.split(/(\/)/)
  const last = list.at(-1)

  if (last.startsWith('index.') || last === 'index') {
    list = list.slice(0, -1)
  }

  return list.join('')
}

function removeLastSlashFromPathname(pathname) {
  return pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname
}

const getPathnameForSearch = (pathname) => {
  let mPathname = pathname

  // no index in pathname
  mPathname = removeIndexFromPathname(mPathname)
  mPathname = removeLastSlashFromPathname(mPathname)

  return mPathname
}

function isPathnameMatchForSearch({ url, pathnameForSearch }) {
  const oUrl = new URL(url);
  const normalizedPathname = getPathnameForSearch(oUrl.pathname);

  return normalizedPathname === pathnameForSearch
}

function isSearchParamsMatchForSearch({ url, requiredSearchParams }) {
  if (!requiredSearchParams) {
    return true
  }

  const oUrl = new URL(url);
  const oSearchParams = oUrl.searchParams;

  return Object.keys(requiredSearchParams)
    .every((key) => oSearchParams.get(key) === requiredSearchParams[key])
}

async function startPartialUrlSearch(url) {
  const settings = await extensionSettings.get()
  if (!settings[USER_OPTION.USE_PARTIAL_URL_SEARCH]) {
    return {
      isSearchAvailable: false,
    }
  }

  logUS('startPartialUrlSearch () 00', url)

  try {
    const targetHostSettings = getHostSettings(url)
    logUS('startPartialUrlSearch targetHostSettings', !!targetHostSettings, targetHostSettings)

    // if (!targetHostSettings) {
    //   return {
    //     isSearchAvailable: false,
    //   }
    // }

    const oUrl = new URL(url);
    oUrl.search = ''
    if (!targetHostSettings?.isHashRequired) {
      oUrl.hash = ''
    }
    oUrl.pathname = getPathnameForSearch(oUrl.pathname)
    const urlForSearch = oUrl.toString();

    let requiredSearchParams
    if (targetHostSettings) {
      const { importantSearchParamList } = targetHostSettings

      if (isNotEmptyArray(importantSearchParamList)) {
        const oSearchParams = oUrl.searchParams;
        requiredSearchParams = {}
        importantSearchParamList.forEach((searchParam) => {
          requiredSearchParams[searchParam] = oSearchParams.get(searchParam)
        })
      }
    }

    const { pathname: pathnameForSearch } = new URL(urlForSearch);

    return {
      isSearchAvailable: true,
      urlForSearch,
      isUrlMatchToPartialUrlSearch: (testUrl) => isPathnameMatchForSearch({ url: testUrl, pathnameForSearch })
        && isSearchParamsMatchForSearch({ url: testUrl, requiredSearchParams })
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    return {
      isSearchAvailable: false,
    }
  }
}
const logCUA = makeLogFunction({ module: 'clear-url.api' })

const isPathnameMatchForPattern = ({ pathname, patternList }) => {
  logCUA('isPathnameMatch () 00', pathname)
  logCUA('isPathnameMatch () 00', patternList)

  const pathToList = (pathname) => {
    let list = pathname.split(/(\/)/).filter(Boolean)
  
    if (1 < list.length && list.at(-1) === '/') {
      list = list.slice(0, -1)
    }  
  
    return list
  }
  const isPartsEqual = (patternPart, pathPart) => {
    let result

    if (patternPart.startsWith(':')) {
      result = pathPart && pathPart != '/'
    } else {
      result = pathPart === patternPart
    } 
    logCUA('isPartsEqual () 11', patternPart, pathPart, result)
  
    return result
  }
  
  let isMath = false
  const pathAsList = pathToList(pathname)
  logCUA('isPathnameMatch () 11 pathAsList', pathAsList)

  let i = 0
  while (!isMath && i < patternList.length) {
    const pattern = patternList[i]
    const patternAsList = pathToList(pattern)
    logCUA('isPathnameMatch () 11 patternAsList', patternAsList)

    isMath = patternAsList.length > 0 && pathAsList.length === patternAsList.length 
      && patternAsList.every((patternPart, patternIndex) => isPartsEqual(patternPart, pathAsList[patternIndex])
    )
    i += 1
  }

  return isMath
}

const removeQueryParamsIfTarget = (url) => {
  logCUA('removeQueryParamsIfTarget () 00', url)
  let cleanUrl = url

  try {
    const targetHostSettings = getHostSettings(url)
    logCUA('removeQueryParamsIfTarget () 11 targetHostSettings', targetHostSettings)

    if (targetHostSettings) {
      const { removeAllSearchParamForPath, removeSearchParamList } = targetHostSettings
      logCUA('removeQueryParamsIfTarget () 22 removeSearchParamList', removeSearchParamList)
 
      const oUrl = new URL(url);
      const { pathname, searchParams: oSearchParams } = oUrl;

      if (isNotEmptyArray(removeSearchParamList)) {
        logCUA('removeQueryParamsIfTarget () 33 isNotEmptyArray(removeSearchParamList)')
        // remove query params by list
        const isHasThisSearchParams = removeSearchParamList.some((searchParam) => oSearchParams.get(searchParam) !== null)

        if (isHasThisSearchParams) {
          removeSearchParamList.forEach((searchParam) => {
            oSearchParams.delete(searchParam)
          })
          oUrl.search = oSearchParams.size > 0
            ? `?${oSearchParams.toString()}`
            : ''
        }         
      }

      if (isNotEmptyArray(removeAllSearchParamForPath)) {
        if (isPathnameMatchForPattern({ pathname, patternList: removeAllSearchParamForPath })) {
          // remove all search params
          oUrl.search = ''
        }
      }

      cleanUrl = oUrl.toString();  
    }
  
  // eslint-disable-next-line no-unused-vars
  } catch (_e) 
  // eslint-disable-next-line no-empty
  {
    
  }

  logCUA('removeQueryParamsIfTarget () 99 cleanUrl', cleanUrl)

  return cleanUrl
}

async function clearUrlOnPageOpen({ tabId, url }) {
  let cleanUrl
  const settings = await extensionSettings.get()

  if (settings[USER_OPTION.CLEAR_URL_ON_PAGE_OPEN]) {
    cleanUrl = removeQueryParamsIfTarget(url);
    
    if (url !== cleanUrl) {
      await changeUrlInTab({ tabId, url: cleanUrl })
    }
  }  

  return cleanUrl || url
}
const logGB = makeLogFunction({ module: 'get-bookmarks.api.js' })

const getParentIdList = (bookmarkList = []) => {
  const parentIdList = bookmarkList
    .map((bookmarkItem) => bookmarkItem.parentId)
    .filter(Boolean)

  return Array.from(new Set(parentIdList))
}

const getFullPath = (id, bkmFolderById) => {
  const path = [];

  let currentId = id;
  while (currentId) {
    const folder = bkmFolderById.get(currentId);
    path.push(folder.title);
    currentId = folder.parentId;
  }

  return path.filter(Boolean).toReversed()
}

async function addBookmarkParentInfo(bookmarkList, bookmarkByIdMap) {
  // parentIdList.length <= bookmarkList.length
  // for root folders parentIdList=[]
  const parentIdList = getParentIdList(bookmarkList)

  if (parentIdList.length === 0) {
    return
  }

  const knownParentIdList = [];
  const unknownParentIdList = [];

  parentIdList.forEach((id) => {
    if (bookmarkByIdMap.has(id)) {
      knownParentIdList.push(id)
    } else {
      unknownParentIdList.push(id)
    }
  })

  const knownFolderList = knownParentIdList.map((id) => bookmarkByIdMap.get(id))

  if (unknownParentIdList.length > 0) {
    const unknownFolderList = await browser.bookmarks.get(unknownParentIdList)

    unknownFolderList.forEach((folder) => {
      bookmarkByIdMap.add(
        folder.id,
        {
          title: folder.title,
          parentId: folder.parentId,
        }
      )
      knownFolderList.push(folder)
    })
  }

  return await addBookmarkParentInfo(knownFolderList, bookmarkByIdMap)
}

async function getBookmarkInfo(url) {
  logGB('getBookmarkInfo () 00', url)
  const bkmListForUrl = await browser.bookmarks.search({ url });
  logGB('getBookmarkInfo () 11 search({ url })', bkmListForUrl.length, bkmListForUrl)
  const bookmarkList = bkmListForUrl.map((item) => ({ ...item, source: 'original url' }))

  // 1 < pathname.length : it is not root path
  //    for https://www.youtube.com/watch?v=qqqqq other conditions than 1 < pathname.length
  // urlForSearch !== url : original url has search params, ending /, index[.xxxx]
  //  original url can be normalized yet, but I want get url with search params, ending /, index[.xxxx]

  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch(url)
  logGB('getBookmarkInfo () 22 startPartialUrlSearch', { isSearchAvailable, urlForSearch })

  if (isSearchAvailable) {
    const bkmListForSubstring = await browser.bookmarks.search(urlForSearch);
    logGB('getBookmarkInfo () 33 search(normalizedUrl)', bkmListForSubstring.length, bkmListForSubstring)

    const yetSet = new Set(bkmListForUrl.map(({ id }) => id))

    bkmListForSubstring.forEach((bkm) => {
      if (bkm.url && isUrlMatchToPartialUrlSearch(bkm.url) && !yetSet.has(bkm.id)) {
        bookmarkList.push({
          ...bkm,
          source: 'substring',
        })
      }
    })
  }

  await addBookmarkParentInfo(bookmarkList, memo.bkmFolderById)

  logGB('getBookmarkInfo () 99 bookmarkList', bookmarkList.length, bookmarkList)
  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)

      return {
        id: bookmarkItem.id,
        fullPathList,
        title: bookmarkItem.title,
        parentId: bookmarkItem.parentId,
        source: bookmarkItem.source,
        url: bookmarkItem.url,
      }
    });
}

async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkList;
  let source;

  if (useCache) {
    bookmarkList = memo.cacheUrlToInfo.get(url);

    if (bookmarkList) {
      source = SOURCE.CACHE;
      logGB('getBookmarkInfoUni OPTIMIZATION: from cache bookmarkInfo')
    }
  }

  if (!bookmarkList) {
    bookmarkList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkList);
  }

  return {
    bookmarkList,
    source,
  };
}
const logHA = makeLogFunction({ module: 'history.api' })

const dayMS = 86400000;
const hourMS = 3600000;
const minMS = 60000;

function formatPrevVisit (inMS) {

  const dif = Date.now() - inMS;

  let result = ''
  const days = Math.floor(dif / dayMS)

  if (days > 0) {
    result = `D ${days}`
  } else {
    const hours = Math.floor(dif / hourMS)

    if (hours > 0) {
      result = `h ${hours}`
    } else {
      const mins = Math.floor(dif / minMS)

      if (mins > 0) {
        result = `m ${mins}`
      } else {
        result = 'm 0'
      }
    }
  }

  return result
}

function filterTimeList(timeList) {
  const representationSet = new Set()
  const resultNewToOld = []

  for (const visitTime of timeList) {
    const visitRepresentation = formatPrevVisit(visitTime)

    if (!(representationSet.has(visitRepresentation))) {
      representationSet.add(visitRepresentation)
      resultNewToOld.push(visitTime)

      if (representationSet.size >= 3) {
        break
      }
    }
  }

  return resultNewToOld
}

async function getVisitListForUrl(url) {
  const visitList = (await browser.history.getVisits({ url }))
    .filter((i) => i.visitTime)
   
  let newToOldList
  let previousList

  // browser has opened tab with url1, close browser, open browser
  //  chrome create visit with transition 'reopen'
  //  firefox does't create visit
  //    how differ in firefox?
  //      just manually opened tab with url2
  //      tab from previous session with url1
  //    visit.visitTime > browserProfileStartTime
  if (IS_BROWSER_FIREFOX) {
    newToOldList = visitList
    
    const mostNewVisitMS = newToOldList[0]?.visitTime
    const startTime = await browserStartTime.get()

    if (mostNewVisitMS && mostNewVisitMS > startTime) {
      previousList = newToOldList.slice(1)
    } else {
      previousList = newToOldList
    }
  } else {
    newToOldList = visitList.toReversed()
    previousList = newToOldList.slice(1)
  }
  
  const filteredList = previousList.filter(({ transition }) => transition !== 'reload')
  const filteredTimeList = filteredList
    .map((i) => i.visitTime)

  return filteredTimeList
}

async function getVisitListForUrlList(urlList) {
  const allVisitList = await Promise.all(urlList.map(
    url => getVisitListForUrl(url)
  ))

  return allVisitList
    .flat()
    .sort((a,b) => -(a - b))
}

async function getPreviousVisitList(url) {
  const {
    isSearchAvailable,
    urlForSearch,
    isUrlMatchToPartialUrlSearch,
  } = await startPartialUrlSearch(url)

  let historyItemList

  if (isSearchAvailable) {
    historyItemList = (await browser.history.search({
      text: urlForSearch,
      maxResults: 10,
    }))
      .filter(
        (i) => i.url && isUrlMatchToPartialUrlSearch(i.url)
      )
  } else {
    historyItemList = (await browser.history.search({
      text: url,
      maxResults: 10,
    }))
      .filter((i) => i.url && i.url.startsWith(url))
  }

  return getVisitListForUrlList(historyItemList.map(i => i.url))
}

async function getHistoryInfo({ url }) {
  logHA('getHistoryInfo () 00', url)
  const allVisitList = await getPreviousVisitList(url);
  logHA('getHistoryInfo () 11 allVisitList', allVisitList)
  const groupedList = allVisitList.flatMap((value, index, array) => index === 0 || array[index - 1] - value  > 60000 ? [value]: [])
  logHA('getHistoryInfo () 22 groupedList', groupedList)
  const filteredList = filterTimeList(groupedList)
  logHA('getHistoryInfo () 33 filteredList', filteredList)

  const visitString = filteredList
    .toReversed()
    .map((i) => formatPrevVisit(i))
    .flatMap((value, index, array) => index === 0 || value !== array[index - 1] ? [value]: [])
    .join(", ")
  
  logHA('getHistoryInfo () 44 visitString', visitString)

  return {
    visitString
  };
}
const logIX = makeLogFunction({ module: 'init-extension' })

async function createContextMenu(settings) {
  await browser.menus.removeAll();

  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, selection as a tag',
  });  
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_INPUT_MENU,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'add bookmark, tag from input',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url from hash and all search params',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'get url from url',
  });
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  browser.menus.create({
    id: CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });

  if (settings[USER_OPTION.HIDE_PAGE_HEADER_FOR_YOUTUBE]) {
    browser.menus.create({
      id: CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER,
      contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
      title: 'toggle youtube page header',
    });  
  }
}

async function setFirstActiveTab({ debugCaller='' }) {
  logIX(`setFirstActiveTab() 00 <- ${debugCaller}`, memo['activeTabId'])

  if (!memo.activeTabId) {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const [Tab] = tabs;

    if (Tab?.id) {
      memo.activeTabId = Tab.id;
      memo.activeTabUrl = Tab.url

      logIX(`setFirstActiveTab() 11 <- ${debugCaller}`, memo['activeTabId'])
    }
  }
}

async function initFromUserOptions() {
  await extensionSettings.restoreFromStorage()
  const settings = await extensionSettings.get()

  await Promise.all([
    createContextMenu(settings),
    tagList.readFromStorage(),
  ])
}

async function initExtension({ debugCaller='' }) {
  const isInitRequired = !browserStartTime.isActual() || !extensionSettings.isActual() || !memo.activeTabId
  if (isInitRequired) {
    logIX(`initExtension() 00 <- ${debugCaller}`)
  }

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && initFromUserOptions(),
    !memo.activeTabId && setFirstActiveTab({ debugCaller: `initExtension() <- ${debugCaller}` }),
  ])

  if (isInitRequired) {
    logIX('initExtension() end')
  }
}
const logTA = makeLogFunction({ module: 'tabs.api' })

async function updateTab({ tabId, url: inUrl, debugCaller, useCache=false }) {
  logTA(`UPDATE-TAB () 00 <- ${debugCaller}`, tabId);
  let url = inUrl

  if (!url) {
    try {
      const Tab = await browser.tabs.get(tabId);
      url = Tab?.url
    } catch (er) {
      logTA('IGNORING. tab was deleted', er);
    }
  }

  if (!(url && isSupportedProtocol(url))) {
    return
  }

  logTA('UPDATE-TAB () 11', url);

  await initExtension({ debugCaller: 'updateTab ()' })
  const settings = await extensionSettings.get()

  let visitsData
  const isShowVisits = settings[USER_OPTION.SHOW_PREVIOUS_VISIT]

  const [
    bookmarkInfo,
    visitInfo,
  ] = await Promise.all([
    getBookmarkInfoUni({ url, useCache }),
    isShowVisits && getHistoryInfo({ url }),
  ])
  logTA(`UPDATE-TAB () 22 bookmarkInfo.bookmarkList`, bookmarkInfo.bookmarkList);

  if (isShowVisits) {
    visitsData = {
      visitString: visitInfo.visitString,
    }
  }

  const data = {
    bookmarkList: bookmarkInfo.bookmarkList,
    isShowTitle: settings[USER_OPTION.SHOW_BOOKMARK_TITLE],
    // visits history
    ...visitsData,
    // recent list
    tagList: tagList.list,
    isShowTagList: settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN],
    tagLength: settings[USER_OPTION.TAG_LIST_TAG_LENGTH],
    // page settings
    isHideSemanticHtmlTagsOnPrinting: settings[USER_OPTION.HIDE_TAG_HEADER_ON_PRINTING],
    isHideHeaderForYoutube: settings[USER_OPTION.HIDE_PAGE_HEADER_FOR_YOUTUBE],
  }
  logTA('UPDATE-TAB () 99 sendMessage', tabId, data);
  await updateBookmarkInfoInPage({ tabId, data })
}

function updateTabTask(options) {
  if (options?.isStop) {
    return
  }

  updateTab(options)
}

const debouncedUpdateTab = debounce(updateTabTask, 30)

function debouncedUpdateActiveTab({ debugCaller } = {}) {
  logTA('debouncedUpdateActiveTab () 00', 'memo[\'activeTabId\']', memo['activeTabId'])

  if (memo.activeTabId) {
    debouncedUpdateTab({
      tabId: memo.activeTabId,
      debugCaller: `debouncedUpdateActiveTab () <- ${debugCaller}`,
    })
  }
}

async function updateActiveTab({ tabId, url, useCache, debugCaller } = {}) {
  // stop debounced
  debouncedUpdateTab({ isStop: true })

  updateTab({
    tabId,
    url,
    useCache,
    debugCaller: `updateActiveTab () <- ${debugCaller}`,
  })
}
const pluralRules = [];
const singularRules = [];
const uncountables = {};
const irregularPlurals = {};
const irregularSingles = {};

function sanitizeRule (rule) {
  if (typeof rule === 'string') {
    return new RegExp('^' + rule + '$', 'i');
  }

  return rule;
}

function addPluralRule(rule, replacement) {
  pluralRules.push([sanitizeRule(rule), replacement]);
};

function addSingularRule(rule, replacement) {
  singularRules.push([sanitizeRule(rule), replacement]);
};

function addUncountableRule(word) {
  if (typeof word === 'string') {
    uncountables[word.toLowerCase()] = true;
    return;
  }

  // Set singular and plural references for the word.
  addPluralRule(word, '$0');
  addSingularRule(word, '$0');
};

function addIrregularRule(single, plural) {
  plural = plural.toLowerCase();
  single = single.toLowerCase();

  irregularSingles[single] = plural;
  irregularPlurals[plural] = single;
};

/**
 * Irregular rules.
 */
[
  // Pronouns.
  ['I', 'we'],
  ['me', 'us'],
  ['he', 'they'],
  ['she', 'they'],
  ['them', 'them'],
  ['myself', 'ourselves'],
  ['yourself', 'yourselves'],
  ['itself', 'themselves'],
  ['herself', 'themselves'],
  ['himself', 'themselves'],
  ['themself', 'themselves'],
  ['is', 'are'],
  ['was', 'were'],
  ['has', 'have'],
  ['this', 'these'],
  ['that', 'those'],
  ['my', 'our'],
  ['its', 'their'],
  ['his', 'their'],
  ['her', 'their'],
  // Words ending in with a consonant and `o`.
  ['echo', 'echoes'],
  ['dingo', 'dingoes'],
  ['volcano', 'volcanoes'],
  ['tornado', 'tornadoes'],
  ['torpedo', 'torpedoes'],
  // Ends with `us`.
  ['genus', 'genera'],
  ['viscus', 'viscera'],
  // Ends with `ma`.
  ['stigma', 'stigmata'],
  ['stoma', 'stomata'],
  ['dogma', 'dogmata'],
  ['lemma', 'lemmata'],
  ['schema', 'schemata'],
  ['anathema', 'anathemata'],
  // Other irregular rules.
  ['ox', 'oxen'],
  ['axe', 'axes'],
  ['die', 'dice'],
  ['yes', 'yeses'],
  ['foot', 'feet'],
  ['eave', 'eaves'],
  ['goose', 'geese'],
  ['tooth', 'teeth'],
  ['quiz', 'quizzes'],
  ['human', 'humans'],
  ['proof', 'proofs'],
  ['carve', 'carves'],
  ['valve', 'valves'],
  ['looey', 'looies'],
  ['thief', 'thieves'],
  ['groove', 'grooves'],
  ['pickaxe', 'pickaxes'],
  ['passerby', 'passersby'],
  ['canvas', 'canvases']
].forEach(function (rule) {
  return addIrregularRule(rule[0], rule[1]);
});

/**
 * Pluralization rules.
 */
[
  [/s?$/i, 's'],
  // eslint-disable-next-line no-control-regex
  [/[^\u0000-\u007F]$/i, '$0'],
  [/([^aeiou]ese)$/i, '$1'],
  [/(ax|test)is$/i, '$1es'],
  [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
  [/(e[mn]u)s?$/i, '$1s'],
  [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
  [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
  [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
  [/(seraph|cherub)(?:im)?$/i, '$1im'],
  [/(her|at|gr)o$/i, '$1oes'],
  [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
  [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
  [/sis$/i, 'ses'],
  [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
  [/([^aeiouy]|qu)y$/i, '$1ies'],
  [/([^ch][ieo][ln])ey$/i, '$1ies'],
  [/(x|ch|ss|sh|zz)$/i, '$1es'],
  [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
  [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
  [/(pe)(?:rson|ople)$/i, '$1ople'],
  [/(child)(?:ren)?$/i, '$1ren'],
  [/eaux$/i, '$0'],
  [/m[ae]n$/i, 'men'],
  ['thou', 'you']
].forEach(function (rule) {
  return addPluralRule(rule[0], rule[1]);
});

/**
 * Singularization rules.
 */
[
  [/s$/i, ''],
  [/(ss)$/i, '$1'],
  [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
  [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
  [/ies$/i, 'y'],
  [/(dg|ss|ois|lk|ok|wn|mb|th|ch|ec|oal|is|ck|ix|sser|ts|wb)ies$/i, '$1ie'],
  [/\b(l|(?:neck|cross|hog|aun)?t|coll|faer|food|gen|goon|group|hipp|junk|vegg|(?:pork)?p|charl|calor|cut)ies$/i, '$1ie'],
  [/\b(mon|smil)ies$/i, '$1ey'],
  [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
  [/(seraph|cherub)im$/i, '$1'],
  [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
  [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
  [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
  [/(test)(?:is|es)$/i, '$1is'],
  [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
  [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
  [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
  [/(alumn|alg|vertebr)ae$/i, '$1a'],
  [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
  [/(matr|append)ices$/i, '$1ix'],
  [/(pe)(rson|ople)$/i, '$1rson'],
  [/(child)ren$/i, '$1'],
  [/(eau)x?$/i, '$1'],
  [/men$/i, 'man']
].forEach(function (rule) {
  return addSingularRule(rule[0], rule[1]);
});

/**
 * Uncountable rules.
 */
[
  // Singular words with no plurals.
  'adulthood',
  'advice',
  'agenda',
  'aid',
  'aircraft',
  'alcohol',
  'ammo',
  'analytics',
  'anime',
  'athletics',
  'audio',
  'bison',
  'blood',
  'bream',
  'buffalo',
  'butter',
  'carp',
  'cash',
  'chassis',
  'chess',
  'clothing',
  'cod',
  'commerce',
  'cooperation',
  'corps',
  'debris',
  'diabetes',
  'digestion',
  'elk',
  'energy',
  'equipment',
  'excretion',
  'expertise',
  'firmware',
  'flounder',
  'fun',
  'gallows',
  'garbage',
  'graffiti',
  'hardware',
  'headquarters',
  'health',
  'herpes',
  'highjinks',
  'homework',
  'housework',
  'information',
  'jeans',
  'justice',
  'kudos',
  'labour',
  'literature',
  'machinery',
  'mackerel',
  'mail',
  'media',
  'mews',
  'moose',
  'music',
  'mud',
  'manga',
  'news',
  'only',
  'personnel',
  'pike',
  'plankton',
  'pliers',
  'police',
  'pollution',
  'premises',
  'rain',
  'research',
  'rice',
  'salmon',
  'scissors',
  'series',
  'sewage',
  'shambles',
  'shrimp',
  'software',
  'staff',
  'swine',
  'tennis',
  'traffic',
  'transportation',
  'trout',
  'tuna',
  'wealth',
  'welfare',
  'whiting',
  'wildebeest',
  'wildlife',
  'you',
  /pok[eé]mon$/i,
  // Regexes.
  /[^aeiou]ese$/i, // "chinese", "japanese"
  /deer$/i, // "deer", "reindeer"
  /fish$/i, // "fish", "blowfish", "angelfish"
  /measles$/i,
  /o[iu]s$/i, // "carnivorous"
  /pox$/i, // "chickpox", "smallpox"
  /sheep$/i
].forEach(addUncountableRule);
const isHasOwnProperty = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

function restoreCase (word, token) {
  // Tokens are an exact match.
  if (word === token) return token;

  // Lower cased words. E.g. "hello".
  if (word === word.toLowerCase()) return token.toLowerCase();

  // Upper cased words. E.g. "WHISKY".
  if (word === word.toUpperCase()) return token.toUpperCase();

  // Title cased words. E.g. "Title".
  if (word[0] === word[0].toUpperCase()) {
    return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
  }

  // Lower cased words. E.g. "test".
  return token.toLowerCase();
}

function interpolate (str, args) {
  return str.replace(/\$(\d{1,2})/g, function (match, index) {
    return args[index] || '';
  });
}

function replace (word, rule) {
  return word.replace(rule[0], function (match, index) {
    var result = interpolate(rule[1], arguments);

    if (match === '') {
      return restoreCase(word[index - 1], result);
    }

    return restoreCase(match, result);
  });
}

function sanitizeWord (token, word, rules) {
  // Empty string or doesn't need fixing.
  if (!token.length || isHasOwnProperty(uncountables, token)) {
    return word;
  }

  var len = rules.length;

  // Iterate over the sanitization rules and use the first one to match.
  while (len--) {
    var rule = rules[len];

    if (rule[0].test(word)) return replace(word, rule);
  }

  return word;
}

function replaceWord (replaceMap, keepMap, rules) {
  return function (word) {
    // Get the correct token and case restoration functions.
    var token = word.toLowerCase();

    // Check against the keep object map.
    if (isHasOwnProperty(keepMap, token)) {
      return restoreCase(word, token);
    }

    // Check against the replacement map for a direct word replacement.
    if (isHasOwnProperty(replaceMap, token)) {
      return restoreCase(word, replaceMap[token]);
    }

    // Run all the rules against the word.
    return sanitizeWord(token, word, rules);
  };
}

function checkWord (replaceMap, keepMap, rules) {
  return function (word) {
    var token = word.toLowerCase();

    if (isHasOwnProperty(keepMap, token)) return true;
    if (isHasOwnProperty(replaceMap, token)) return false;

    return sanitizeWord(token, token, rules) === token;
  };
}

// eslint-disable-next-line no-unused-vars
const plural = replaceWord(
  irregularSingles, irregularPlurals, pluralRules
);

// eslint-disable-next-line no-unused-vars
const isPlural = checkWord(
  irregularSingles, irregularPlurals, pluralRules
);

const singular = replaceWord(
  irregularPlurals, irregularSingles, singularRules
);

// eslint-disable-next-line no-unused-vars
const isSingular = checkWord(
  irregularPlurals, irregularSingles, singularRules
);
const trimTitle = (title) => title
  .trim()
  .replace(/\s+/, ' ')

const trimLow = (title) => {
  const trimmedTitle = title
    .trim()
    .replace(/\s+/, ' ')
    .toLowerCase()

  return trimmedTitle
}

const trimLowSingular = (title) => {
  const trimmedTitle = trimLow(title)

  const wordList = trimmedTitle.split(' ')
  const lastWord = wordList.at(-1)
  const singularLastWord = singular(lastWord)
  const normalizedWordList = wordList.with(-1, singularLastWord)
  const normalizedTitle = normalizedWordList.join(' ')

  return normalizedTitle
}

const normalizeTitle = (title) => trimLowSingular(title.replaceAll('-', ''))

function isStartWithTODO(str) {
  return !!str && str.slice(0, 4).toLowerCase() === 'todo'
}
const logFA = makeLogFunction({ module: 'folder.api' })

function findFolderFrom({ normalizedTitle, startFolder }) {
  function traverseSubFolder(folderNode) {
    if (normalizeTitle(folderNode.title) === normalizedTitle) {
      return folderNode
    }

    const folderList = folderNode.children
      .filter(({ url }) => !url)

    let foundItem
    let i = 0
    while (!foundItem && i < folderList.length) {
      foundItem = traverseSubFolder(folderList[i])
      i += 1
    }
  }

  return traverseSubFolder(startFolder)
}

async function findFolderInSubtree({ normalizedTitle, parentId }) {
  logFA('findFolderInSubtree 00 normalizedTitle', normalizedTitle, parentId)
  // search in direct children
  const firstLevelNodeList = await browser.bookmarks.getChildren(parentId)
  let foundItem = firstLevelNodeList.find((node) => !node.url && normalizeTitle(node.title) === normalizedTitle)
  logFA('findFolderInSubtree 11 firstLevelNodeList', foundItem)

  if (!foundItem) {
    // search in subfolders of direct children
    const [otherBookmarks] = await browser.bookmarks.getSubTree(parentId)
    const batchList = []

    for (const firstLevelNode of otherBookmarks.children) {
      if (!firstLevelNode.url) {
        const secondLevelFolderList = firstLevelNode.children.filter(({ url }) => !url)
        batchList.push(secondLevelFolderList)
      }
    }

    const allSecondLevelFolderList = batchList.flat()

    let i = 0
    while (!foundItem && i < allSecondLevelFolderList.length) {
      foundItem = findFolderFrom({ normalizedTitle, startFolder: allSecondLevelFolderList[i] })
      i += 1
    }
    logFA('findFolderInSubtree 22 secondLevelFolderList', foundItem)
  }

  return foundItem
}

// option 1
//  getChildren, filter folders, compare (case insensitive, plural insensitive)
//  find here (case insensitive, plural insensitive) folder
// option 2
//  git.search({ title }) // case sensitive,
//    question: will this return folders?
//    filter folders
//  onStart, merge will be
// option 3
//  git.search(query) // case insensitive,
//    question: will this return folders?
//    filter folders
//  onStart, merge will be
async function findFolder(title) {
  logFA('findFolder 00 title', title)
  let foundItem

  const bookmarkList = await browser.bookmarks.search({ title });
  logFA('findFolder 11 search({ title })', bookmarkList.length, bookmarkList)
  let i = 0
  while (!foundItem && i < bookmarkList.length) {
    const checkItem = bookmarkList[i]
    if (!checkItem.url) {
      foundItem = checkItem
    }
    i += 1
  }


  const lowTitle = trimLow(title)

  if (!foundItem && lowTitle.endsWith('.js')) {
    const noDotTitle = `${lowTitle.slice(0, -3)}js`

    const bookmarkList = await browser.bookmarks.search(noDotTitle);
    logFA('findFolder 22 search(title) noDotTitle', noDotTitle)
    logFA('findFolder 22 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLow(checkItem.title) === noDotTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  if (!foundItem) {
    const noDashTitle = trimLowSingular(title.replaceAll('-', ''))
    logFA('findFolder 333 noDashTitle', noDashTitle)

    const bookmarkList = await browser.bookmarks.search(noDashTitle);
    logFA('findFolder 333 search(noDashTitle)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLowSingular(checkItem.title) === noDashTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  if (!foundItem) {
    const dashToSpaceTitle = trimLowSingular(title.replaceAll('-', ' '))
    logFA('findFolder 333 dashToSpaceTitle', dashToSpaceTitle)

    const bookmarkList = await browser.bookmarks.search(dashToSpaceTitle);
    logFA('findFolder 333 search(dashToSpaceTitle)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && trimLowSingular(checkItem.title) === dashToSpaceTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  const normalizedTitle = normalizeTitle(title)
  logFA('findFolder 00 normalizedTitle', normalizedTitle)

  if (!foundItem) {
    logFA('findFolder 33 normalizedTitle', normalizedTitle)

    const bookmarkList = await browser.bookmarks.search(title);
    logFA('findFolder 33 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }


  const lowTitle2 = trimLow(title)
  const lastWord = lowTitle2.split(' ').at(-1)

  if (!foundItem && lastWord.length > 5) {
    const modifiedTitle = lowTitle2.slice(0, -3)

    const bookmarkList = await browser.bookmarks.search(modifiedTitle);
    logFA('findFolder 44 search(title) modifiedTitle', modifiedTitle)
    logFA('findFolder 44 search(title)', bookmarkList.length, bookmarkList)

    let i = 0
    while (!foundItem && i < bookmarkList.length) {
      const checkItem = bookmarkList[i]
      if (!checkItem.url && normalizeTitle(checkItem.title) === normalizedTitle) {
        foundItem = checkItem
      }
      i += 1
    }
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ normalizedTitle, parentId: OTHER_BOOKMARKS_FOLDER_ID })
    logFA('findFolder 55 OTHER_BOOKMARKS_FOLDER_ID', foundItem)
  }

  if (!foundItem) {
    foundItem = await findFolderInSubtree({ normalizedTitle, parentId: BOOKMARKS_BAR_FOLDER_ID })
    logFA('findFolder 66 BOOKMARKS_BAR_FOLDER_ID', foundItem)
  }

  return foundItem
}

async function findOrCreateFolder(title) {
  let folder = await findFolder(title)

  if (!folder) {
    const parentId = isStartWithTODO(title)
      ? BOOKMARKS_BAR_FOLDER_ID
      : OTHER_BOOKMARKS_FOLDER_ID

    const firstLevelNodeList = await browser.bookmarks.getChildren(parentId)
    const findIndex = firstLevelNodeList.find((node) => title.localeCompare(node.title) < 0)
    logFA('findOrCreateFolder 11 findIndex', findIndex?.index, findIndex?.title)

    const folderParams = {
      parentId,
      title,
    }

    if (findIndex) {
      folderParams.index = findIndex.index
    }

    folder = await createFolderIgnoreInController(folderParams)
  }

  return folder
}
async function getMaxUsedSuffix() {
  function getFoldersFromTree(tree) {
    const folderById = {};
    let nTotalBookmark = 0
    let nTotalFolder = 0

    function getFoldersFromNodeArray(nodeArray) {
      let nBookmark = 0
      let nFolder = 0

      nodeArray.forEach((node) => {
        if (node.url) {
          nBookmark += 1
        } else {
          nFolder += 1

          folderById[node.id] = {
            id: node.id,
            title: node.title,
          }

          getFoldersFromNodeArray(node.children)
        }
      });

      nTotalBookmark += nBookmark
      nTotalFolder += nFolder
    }

    getFoldersFromNodeArray(tree);

    return {
      folderById,
      nTotalBookmark,
      nTotalFolder,
    };
  }

  const bookmarkTree = await browser.bookmarks.getTree();
  const { folderById } = getFoldersFromTree(bookmarkTree);

  let maxUsedSuffix
  const allowedFirstChar = '123456789'
  const allowedSecondChar = '0123456789'

  Object.values(folderById).forEach(({ title }) => {
    const wordList = title.trimEnd().split(' ')
    const lastWord = wordList.at(-1)
    const firstWord = wordList.at(-2)

    if (firstWord) {
      const firstChar = lastWord[0]
      const secondCharList = Array.from(lastWord.slice(1))

      const isNumber = allowedFirstChar.includes(firstChar) && secondCharList.every((secondChar) => allowedSecondChar.includes(secondChar))

      if (isNumber) {
        maxUsedSuffix = Math.max(maxUsedSuffix || 0, +lastWord)
      }
    }
  })

  return maxUsedSuffix
}

async function flatChildren({ parentId, freeSuffix }) {
  const notFlatFolderList = []
  const flatFolderList = []

  const [otherBookmarks] = await browser.bookmarks.getSubTree(parentId)

  for (const node of otherBookmarks.children) {
    if (!node.url) {
      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (childrenFolderList.length > 0) {
        notFlatFolderList.push(node)
      } else {
        // flatFolderNameSet.add(node.title)
        flatFolderList.push(node)
      }
    }
  }

  const flatFolderNameSet = new Set()

  const updateTaskList = []
  flatFolderList.forEach((folderNode) => {
    if (flatFolderNameSet.has(folderNode.title)) {
      const newTitle = `${folderNode.title} ${freeSuffix}`
      freeSuffix += 1

      updateTaskList.push({
        id: folderNode.id,
        title: newTitle,
      })
    }
  })
  await updateTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => browser.bookmarks.update(id, { title })
    ),
    Promise.resolve(),
  );

  async function flatFolder(rootFolder) {
    async function traverseSubFolder(folderNode, folderLevel) {
      const folderList = folderNode.children
        .filter(({ url }) => !url)
      const bookmarkList = folderNode.children
        .filter(({ url }) => !!url)

      await folderList.reduce(
        (promiseChain, node) => promiseChain.then(
          () => traverseSubFolder(node, folderLevel + 1)
        ),
        Promise.resolve(),
      );

      if (bookmarkList.length > 0) {
        if (folderLevel > 0) {
          await moveBookmarkIgnoreInController({ id: folderNode.id, parentId })

          if (flatFolderNameSet.has(folderNode.title)) {
            const newTitle = `${folderNode.title} ${freeSuffix}`
            freeSuffix += 1

            await browser.bookmarks.update(folderNode.id, {
              title: newTitle,
            })
            flatFolderNameSet.add(newTitle)
          } else {
            flatFolderNameSet.add(folderNode.title)
          }
        }
      } else {
        await browser.bookmarks.remove(folderNode.id)
      }
    }

    await traverseSubFolder(rootFolder, 0)
  }

  // flat
  await notFlatFolderList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => flatFolder(node)
    ),
    Promise.resolve(),
  );
}

async function flatFolders() {
  const usedSuffix = await getMaxUsedSuffix()
  let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;

  await flatChildren({ parentId: BOOKMARKS_BAR_FOLDER_ID, freeSuffix })
  await flatChildren({ parentId: OTHER_BOOKMARKS_FOLDER_ID, freeSuffix })
}
async function moveContent(fromFolderId, toFolderId) {
  const nodeList = await browser.bookmarks.getChildren(fromFolderId)

  await nodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: node.id, parentId: toFolderId })
    ),
    Promise.resolve(),
  );
}

async function mergeSubFolder(parentId) {
  // console.log('### mergeSubFolder 00,', parentId)
  const nodeList = await browser.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)
  const nameSet = {}

  for (const node of folderNodeList) {
    const normalizedTitle = normalizeTitle(node.title)

    if (!nameSet[normalizedTitle]) {
      nameSet[normalizedTitle] = [node]
    } else {
      nameSet[normalizedTitle].push(node)
    }
  }
  // console.log('### mergeSubFolder 11: nameSet', nameSet)

  const notUniqList = Object.entries(nameSet).filter(([, nodeList]) => nodeList.length > 1)
  const moveTaskList = []
  for (const [, nodeList] of notUniqList) {
    const sortedList = nodeList.toSorted((a, b) => -a.title.localeCompare(b.title))
    const firstNode = sortedList[0]
    const restNodeList = nodeList.filter((item) => item.id != firstNode.id)

    for (const fromNode of restNodeList) {
      moveTaskList.push({
        fromNode,
        toNode: firstNode,
      })
    }
  }
  // console.log('### moveTaskList', moveTaskList.map(({ fromNode, toNode }) => `${fromNode.title} -> ${toNode.title}`))

  await moveTaskList.reduce(
    (promiseChain, { fromNode, toNode }) => promiseChain.then(
      () => moveContent(fromNode.id, toNode.id)
    ),
    Promise.resolve(),
  );

  await moveTaskList.reduce(
    (promiseChain, { fromNode }) => promiseChain.then(
      () => browser.bookmarks.remove(fromNode.id)
    ),
    Promise.resolve(),
  );
}

async function trimTitleInSubFolder(parentId) {
  const nodeList = await browser.bookmarks.getChildren(parentId)
  const folderNodeList = nodeList.filter(({ url }) => !url)

  const renameTaskList = []
  for (const folderNode of folderNodeList) {

    const trimmedTitle = trimTitle(folderNode.title)
    if (folderNode.title !== trimmedTitle) {
      renameTaskList.push({
        id: folderNode.id,
        title: trimmedTitle,
      })
    }
  }

  await renameTaskList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => browser.bookmarks.update(id, { title })
    ),
    Promise.resolve(),
  );
}

async function mergeFolders() {
  await mergeSubFolder(BOOKMARKS_BAR_FOLDER_ID)
  await mergeSubFolder(OTHER_BOOKMARKS_FOLDER_ID)

  await trimTitleInSubFolder(BOOKMARKS_BAR_FOLDER_ID)
  await trimTitleInSubFolder(OTHER_BOOKMARKS_FOLDER_ID)
}
async function moveContentToStart(fromFolderId, toFolderId) {
  const nodeList = await browser.bookmarks.getChildren(fromFolderId)
  const reversedNodeList = nodeList.toReversed()

  await reversedNodeList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: node.id, parentId: toFolderId, index: 0 })
    ),
    Promise.resolve(),
  );
}

async function moveNotDescriptiveFolders({ fromId, unclassifiedId }) {
  const nodeList = await browser.bookmarks.getChildren(fromId)
  const folderList = nodeList
    .filter(({ url }) => !url)
    .filter(({ title }) => !isDescriptiveFolderTitle(title))

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => moveContentToStart(folderNode.id, unclassifiedId)
    ),
    Promise.resolve(),
  );

  await folderList.reduce(
    (promiseChain, folderNode) => promiseChain.then(
      () => browser.bookmarks.remove(folderNode.id)
    ),
    Promise.resolve(),
  );
}

async function moveNotDescriptiveFoldersToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  await moveNotDescriptiveFolders({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  await moveNotDescriptiveFolders({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}
async function moveRootBookmarks({ fromId, unclassifiedId }) {
  // console.log('### moveRootBookmarks 00,', fromId)

  // url.startsWith('place:')
  // Firefox: Bookmark toolbar\'Most visited', Bookmark menu\'Recent tags'
  const nodeList = await browser.bookmarks.getChildren(fromId)
  const bkmList = nodeList
    .filter(({ url }) => url)
    .filter(({ url }) => !url.startsWith('place:'))
  // console.log('### moveRootBookmarks bkmList,', bkmList)

  await bkmList.reduce(
    (promiseChain, bkm) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: bkm.id, parentId: unclassifiedId })
    ),
    Promise.resolve(),
  );
}

async function moveRootBookmarksToUnclassified() {
  const unclassifiedId = await getUnclassifiedFolderId()

  // await moveRootBookmarks({ fromId: BOOKMARKS_BAR_FOLDER_ID, unclassifiedId })
  // await moveRootBookmarks({ fromId: BOOKMARKS_MENU_FOLDER_ID, unclassifiedId })
  await moveRootBookmarks({ fromId: OTHER_BOOKMARKS_FOLDER_ID, unclassifiedId })
}
async function moveFolderByName({ fromId, toId, isCondition }) {
  const childrenList = await browser.bookmarks.getChildren(fromId)
  let moveList = childrenList
    .filter(({ url }) => !url)

  if (isCondition) {
    moveList = moveList.filter(({ title }) => isCondition(title))
  }

  await moveList.reduce(
    (promiseChain, node) => promiseChain.then(
      () => moveBookmarkIgnoreInController({ id: node.id, parentId: toId })
    ),
    Promise.resolve(),
  );
}

async function moveTodoToBkmBar() {
  await moveFolderByName({
    fromId: BOOKMARKS_BAR_FOLDER_ID,
    toId: OTHER_BOOKMARKS_FOLDER_ID,
    isCondition: (title) => !isStartWithTODO(title)
  })
  await moveFolderByName({
    fromId: OTHER_BOOKMARKS_FOLDER_ID,
    toId: BOOKMARKS_BAR_FOLDER_ID,
    isCondition: (title) => isStartWithTODO(title)
  })
}
async function getDoubles() {
  const doubleList = []

  async function traverseNodeList(nodeList) {
    const urlToIdMap = new ExtraMap()
    nodeList
      .filter(({ url }) => !!url)
      .forEach(({ id, url, title }) => {
        urlToIdMap.concat(url, { id, title })
      })

    for (const idList of urlToIdMap.values()) {
      if (idList.length > 1) {
        const titleToIdMap = new ExtraMap()

        idList.forEach(({ id, title }) => {
          titleToIdMap.concat(title, id)
        })

        for (const idList of titleToIdMap.values()) {
          if (idList.length > 1) {
            idList
              .slice(1)
              .forEach(
                (id) => doubleList.push(id)
              )
          }
        }
      }
    }

    nodeList
      .filter(({ url }) => !url)
      .map(
        (node) => traverseNodeList(node.children)
      )
  }

  const nodeList = await browser.bookmarks.getTree()
  traverseNodeList(nodeList)

  return doubleList
}

async function removeDoubleBookmarks() {
  const doubleList = await getDoubles()
  // console.log('Double bookmarks:', doubleList.length)

  await doubleList.reduce(
    (promiseChain, bkmId) => promiseChain.then(
      () => browser.bookmarks.remove(bkmId)
    ),
    Promise.resolve(),
  );

  return {
    nRemovedDoubles: doubleList.length
  }
}
async function sortChildren(parentId) {
  // console.log('sortChildFoldersOp',  parentId)
  const nodeList = await browser.bookmarks.getChildren(parentId)

  const sortedNodeList = nodeList
    .filter(({ url }) => !url)
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  let minMoveIndex = -1

  async function placeFolder({ node, index }) {
    let nodeActual = node

    if (0 <= minMoveIndex && minMoveIndex <= node.index) {
      ([nodeActual] = await browser.bookmarks.get(node.id))
    }

    if (nodeActual.index != index) {
      await moveBookmarkIgnoreInController({ id: node.id, index })

      if (minMoveIndex == -1) {
        minMoveIndex = index
      }
    }
  }

  await sortedNodeList.reduce(
    (promiseChain, node, index) => promiseChain.then(
      () => placeFolder({ node, index })
    ),
    Promise.resolve(),
  );

  // console.log('Sorted',  sortedNodeList.map(({ title }) => title))
}

async function sortFolders() {
  await sortChildren(BOOKMARKS_BAR_FOLDER_ID)
  await sortChildren(OTHER_BOOKMARKS_FOLDER_ID)
}
async function flatBookmarks() {
  tagList.blockTagList(true)

  try {
    await getOrCreateUnclassifiedFolderId()

    if (IS_BROWSER_FIREFOX) {
      await moveFolderByName({
        fromId: BOOKMARKS_MENU_FOLDER_ID,
        toId: OTHER_BOOKMARKS_FOLDER_ID,
      })
    }

    await flatFolders()
    await moveRootBookmarksToUnclassified()
    await moveNotDescriptiveFoldersToUnclassified()
    await moveTodoToBkmBar()
    await mergeFolders()
    await sortFolders()
    await removeDoubleBookmarks()

  } finally {
    tagList.blockTagList(false)
  }
}

async function addBookmark({ url, title, parentId }) {
  const bookmarkList = await browser.bookmarks.search({ url });
  const isExist = bookmarkList.some((bkm) => bkm.parentId == parentId)
  if (isExist) {
    return
  }

  await createBookmarkWithApi({
    index: 0,
    parentId,
    title,
    url
  })
}

async function startAddBookmarkFromSelection() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await getSelectionInPage(activeTab.id)
  }
}

async function startAddBookmarkFromInput() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await getUserInputInPage(activeTab.id)
  }
}

async function addBookmarkFolderByName({ url, title, folderName }) {
  if (folderName.length > 40) {
    return
  }

  const folder = await findOrCreateFolder(folderName)
  await addBookmark({ url, title, parentId: folder.id })
}
async function addRecentTagFromView(bookmarkId) {
  if (!bookmarkId) {
    return
  }
  
  const [bkmNode] = await browser.bookmarks.get(bookmarkId)
  await tagList.addRecentTagFromBkm(bkmNode)
}
const logCU = makeLogFunction({ module: 'clearUrlInActiveTab' })

function removeHashAndSearchParams(url) {
  logCU('removeHashAndSearchParams () 00', url)
  try {
    const oUrl = new URL(url);
    oUrl.search = ''
    oUrl.hash = ''
  
    return oUrl.toString();  
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return url
  }
}

async function removeFromUrlHashAndSearchParamsInActiveTab() {
  logCU('removeFromUrlHashAndSearchParamsInActiveTab () 00')
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    const cleanUrl = removeHashAndSearchParams(activeTab.url);
    logCU('removeFromUrlHashAndSearchParamsInActiveTab () 22 cleanUrl', cleanUrl)

    if (activeTab.url !== cleanUrl) {
      await changeUrlInTab({ tabId: activeTab.id, url: cleanUrl })
    }
  }
}
async function isHasBookmark(url) {
  const bookmarks = await browser.bookmarks.search({ url });

  return bookmarks.length > 0;
}

async function getTabsWithBookmark(tabList) {
  const tabIdAndUrlList = [];

  tabList
    .filter((Tab) => !Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url;

      if (url) {
        tabIdAndUrlList.push({ tabId: Tab.id, url });
      }
    });

  const uniqUrlList = Array.from(new Set(
    tabIdAndUrlList.map(({ url }) => url)
  ));

  // firefox rejects browser.bookmarks.search({ url: 'about:preferences' })
  const urlHasBookmarkList = (
    await Promise.allSettled(uniqUrlList.map(
      (url) => isHasBookmark(url).then((isHasBkm) => isHasBkm && url)
    ))
  )
    .map(({ value }) => value)
    .filter(Boolean);

  const urlWithBookmarkSet = new Set(urlHasBookmarkList);
  const tabWithBookmarkIdList = tabIdAndUrlList
    .filter(({ url }) => urlWithBookmarkSet.has(url))
    .map(({ tabId }) => tabId)

  return {
    tabWithBookmarkIdList,
  }
}

async function closeBookmarkedTabs() {
  const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabWithIdList = tabs.filter(({ id }) => id);

  const {
    tabWithBookmarkIdList: closeTabIdList,
  } = await getTabsWithBookmark(tabWithIdList);

  const closeTabIdSet = new Set(closeTabIdList)
  let newActiveTabId

  if (activeTab) {
    const activeTabId = activeTab.id;

    if (closeTabIdSet.has(activeTabId)) {

      let leftIndex = activeTabId.index - 1
      while (0 <= leftIndex) {
        const testTab = tabWithIdList[leftIndex]
        if (!closeTabIdSet.has(testTab.id)) {
          newActiveTabId = testTab.id
          break
        }
        leftIndex -= 1
      }

      if (!newActiveTabId) {
        let rightIndex = activeTabId.index + 1
        while (rightIndex < tabWithIdList.length) {
          const testTab = tabWithIdList[rightIndex]
          if (!closeTabIdSet.has(testTab.id)) {
            newActiveTabId = testTab.id
            break
          }
          leftIndex += 1
        }
      }
    }
  }

  if (closeTabIdList.length === tabs.length) {
    // do not close all tabs. It will close window.
    await browser.tabs.create({ index: 0 });
  }

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    closeTabIdList.length > 0 && browser.tabs.remove(closeTabIdList),
  ])
}
async function getDuplicatesTabs(inTabList) {
  const tabList = inTabList.toReversed();
  const duplicateTabIdList = [];
  const uniqUrls = new Map();
  let newActiveTabId;

  // do not change pinned tabs
  tabList
    .filter((Tab) => Tab.pinned)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';
      uniqUrls.set(url, Tab.id);
    });

  // priority for active tab
  tabList
    .filter((Tab) => !Tab.pinned && Tab.active)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        newActiveTabId = uniqUrls.get(url);
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  // other tabs
  tabList
    .filter((Tab) => !Tab.pinned && !Tab.active)
    .forEach((Tab) => {
      const url = Tab.pendingUrl || Tab.url || '';

      if (uniqUrls.has(url)) {
        duplicateTabIdList.push(Tab.id);
      } else {
        uniqUrls.set(url, Tab.id);
      }
    });

  return {
    duplicateTabIdList,
    newActiveTabId,
  }
}

async function closeDuplicateTabs() {
  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    duplicateTabIdList.length > 0 && browser.tabs.remove(duplicateTabIdList),
  ])
}
async function deleteBookmark(bkmId) {
  await browser.bookmarks.remove(bkmId);
}
async function fixTag({ parentId, title }) {
  await tagList.addFixedTag({
    parentId,
    title,
  })
}
const logUU = makeLogFunction({ module: 'getUrlFromUrl' })

async function getUrlFromUrl() {
  logUU('getUrlFromUrl () 00')

  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id && activeTab?.url) {
    let resultUrl
    const oUrl = new URL(activeTab.url)
    logUU('getUrlFromUrl () 11 oUrl', oUrl)
    const { hostname } = oUrl
    const baseDomain = hostname.split('.').slice(-2).join('.')

    try {
      switch (baseDomain) {
        case '9gag.com': {
          let param = oUrl.hash
          const testUrl = param.split('#').at(1)
          const o = new URL(testUrl)

          if (o) {
            resultUrl = testUrl
          }

          break
        }
      }
      // eslint-disable-next-line no-unused-vars
    } catch (e) 
    // eslint-disable-next-line no-empty 
    {

    }

    if (resultUrl) {
      logUU('getUrlFromUrl () 99 call replaceUrlInTab ()')
      await replaceUrlInTab({ tabId: activeTab.id, url: resultUrl })
    }
  }
}
async function moveToFlatFolderStructure() {
  await extensionSettings.update({
    [USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]: true,
  })
  // await tagList.filterTagListForFlatFolderStructure()

  await flatBookmarks()
  await tagList.filterTagListForFlatFolderStructure()
}
async function switchShowRecentList(isShow) {
  await extensionSettings.update({
    [INTERNAL_VALUES.TAG_LIST_IS_OPEN]: isShow
  })
}
async function unfixTag(parentId) {
  await tagList.removeFixedTag(parentId)
}
async function toggleYoutubeHeader() {
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [activeTab] = tabs;

  if (activeTab?.id) {
    await toggleYoutubeHeaderInPage(activeTab.id)
  }
}

const logBC = makeLogFunction({ module: 'bookmarks.controller' })

let lastCreatedBkmId
let lastCreatedBkmTabId
let lastMovedBkmId

const bookmarksController = {
  async onCreated(bookmarkId, node) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreCreate(node)) {
      logBC('bookmark.onCreated ignore', node);
      return
    }

    lastCreatedBkmId = bookmarkId
    lastCreatedBkmTabId = memo.activeTabId

    logBC('bookmark.onCreated <-', node);
    const settings = await extensionSettings.get()

    if (node.url) {
      if (node.index !== 0) {
        await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
      }

      if (settings[USER_OPTION.TAG_LIST_USE]) {
        await tagList.addRecentTagFromBkm(node)
      }
    } else {
      if (settings[USER_OPTION.TAG_LIST_USE]) {
        await tagList.addRecentTagFromFolder(node)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });
  },
  async onChanged(bookmarkId, changeInfo) {
    logBC('bookmark.onChanged 00 <-', changeInfo);
    const settings = await extensionSettings.get()

    const [node] = await browser.bookmarks.get(bookmarkId)

    // eslint-disable-next-line no-empty
    if (node.url) {

    } else {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[USER_OPTION.TAG_LIST_USE] && changeInfo.title) {
        // await tagList.updateTag(bookmarkId, changeInfo.title)
        await tagList.addRecentTagFromFolder(node)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });
  },
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    if (ignoreBkmControllerApiActionSet.hasIgnoreMove(bookmarkId)) {
      logBC('bookmark.onMoved ignore', bookmarkId);
      return
    }

    logBC('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
    const settings = await extensionSettings.get()
    // switch (true) {
    //   // in bookmark manager. no changes for this extension
    //   case parentId === oldParentId: {
    //     break
    //   }
    //   // in bookmark manager.
    //   case index < lastIndex: {
    //     getBookmarkInfoUni({ url: node.url });
    //     break
    //   }
    //   // parentId !== oldParentId && index == lastIndex
    //   // in bookmark manager OR in active tab
    //   default: {

    //   }
    // }
    const [node] = await browser.bookmarks.get(bookmarkId)

    if (node.url) {
      if (parentId !== oldParentId) {
        if (settings[USER_OPTION.TAG_LIST_USE]) {
          await tagList.addRecentTagFromBkm(node);

          const isBookmarkWasCreatedManually = (
            bookmarkId == lastCreatedBkmId
            && memo.activeTabId == lastCreatedBkmTabId
            && !isBookmarkCreatedWithApi({ parentId: oldParentId, url: node.url })
          )

          if (isBookmarkWasCreatedManually) {
            const bookmarkList = await browser.bookmarks.search({ url: node.url });
            const isFirstBookmark = bookmarkList.length == 1
            const isMoveOnly = isBookmarkWasCreatedManually && isFirstBookmark && lastMovedBkmId != bookmarkId

            if (isMoveOnly) {
              if (index !== 0) {
                await moveBookmarkIgnoreInController({ id: bookmarkId, index: 0 })
              }
            } else {
              let isReplaceMoveToCreate = false

              if (IS_BROWSER_CHROME) {
                const isChromeBookmarkManagerTabActive = !!memo.activeTabUrl && memo.activeTabUrl.startsWith('chrome://bookmarks');
                isReplaceMoveToCreate = !isChromeBookmarkManagerTabActive
              } else if (IS_BROWSER_FIREFOX) {
                const childrenList = await browser.bookmarks.getChildren(parentId)
                const lastIndex = childrenList.length - 1
                  // isReplaceMoveToCreate = index == lastIndex && settings[INTERNAL_VALUES.TAG_LIST_IS_OPEN]
                isReplaceMoveToCreate = index == lastIndex
              }

              const unclassifiedFolderId = await getUnclassifiedFolderId()
              isReplaceMoveToCreate = isReplaceMoveToCreate && parentId !== unclassifiedFolderId

              if (isReplaceMoveToCreate) {
                logBC('bookmark.onMoved 22');
                await moveBookmarkIgnoreInController({ id: bookmarkId, parentId: oldParentId, index: oldIndex })

                const { url, title } = node
                const newBkm = {
                  parentId,
                  title,
                  url,
                  index: 0,
                }
                await createBookmarkIgnoreInController(newBkm)
              }
            }
          }
        }

        lastMovedBkmId = bookmarkId
        debouncedUpdateActiveTab({
          debugCaller: 'bookmark.onMoved'
        });
      }
    } else {
      memo.bkmFolderById.delete(bookmarkId);
    }
  },
  async onRemoved(bookmarkId, { node }) {
    logBC('bookmark.onRemoved <-', bookmarkId);
    const settings = await extensionSettings.get()

    if (!node.url) {
      memo.bkmFolderById.delete(bookmarkId);

      if (settings[USER_OPTION.TAG_LIST_USE]) {
        await tagList.removeTag(bookmarkId)
      }
    }

    // changes in active tab
    debouncedUpdateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });
  },
}
const logCC = makeLogFunction({ module: 'commands.controller' })

const commandsController = {
  async onCommand (command) {
    logCC('commandsController.onCommand', command);

    switch (command) {
      case KEYBOARD_CMD_ID.ADD_BOOKMARK_FROM_INPUT_KBD: {
        startAddBookmarkFromInput()
        break;
      }
      case KEYBOARD_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_KBD: {
        startAddBookmarkFromSelection()
        break;
      }
    }
  }
}
const logCMC = makeLogFunction({ module: 'contextMenu.controller' })

const contextMenusController = {
  async onClicked (OnClickData) {
    logCMC('contextMenus.onClicked 00', OnClickData.menuItemId);

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_INPUT_MENU: {
        startAddBookmarkFromInput()
        break;
      }
      case CONTEXT_MENU_CMD_ID.ADD_BOOKMARK_FROM_SELECTION_MENU: {
        startAddBookmarkFromSelection()
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case CONTEXT_MENU_CMD_ID.CLEAR_URL: {
        removeFromUrlHashAndSearchParamsInActiveTab()
        break;
      }
      case CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL: {
        logCMC('contextMenus.onClicked 11 CONTEXT_MENU_CMD_ID.GET_URL_FROM_URL')
        getUrlFromUrl();
        break;
      }
      case CONTEXT_MENU_CMD_ID.TOGGLE_YOUTUBE_HEADER: {
        toggleYoutubeHeader()
        break;
      }
    }
  }
}
const logIM = makeLogFunction({ module: 'incoming-message' })

async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    // IT IS ONLY when new tab load first url
    case EXTENSION_MSG_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      const url = message.url
      logIM('runtime.onMessage contentScriptReady 00', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
      logIM('#  runtime.onMessage contentScriptReady 00', url);

      if (tabId && tabId == memo.activeTabId) {
        logIM('runtime.onMessage contentScriptReady 11 updateTab', 'tabId', tabId, 'memo[\'activeTabId\']', memo['activeTabId']);
        memo.activeTabUrl = url
        const cleanUrl = await clearUrlOnPageOpen({ tabId, url })
        updateActiveTab({
          tabId,
          url: cleanUrl,
          debugCaller: 'runtime.onMessage contentScriptReady',
        })
      }

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK: {
      logIM('runtime.onMessage addBookmark');
      await addBookmark({
        url: message.url,
        title: message.title,
        parentId: message.parentId,
      })

      break
    }
    case EXTENSION_MSG_ID.DELETE_BOOKMARK: {
      logIM('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_MSG_ID.SHOW_TAG_LIST: {
      logIM('runtime.onMessage SHOW_RECENT_LIST');
      await switchShowRecentList(message.value)

      break
    }
    case EXTENSION_MSG_ID.FIX_TAG: {
      logIM('runtime.onMessage fixTag');
      await fixTag({
        parentId: message.parentId,
        title: message.title,
      })

      const tabId = sender?.tab?.id;
      if (tabId == memo.activeTabId) {
        updateActiveTab({
          tabId,
          debugCaller: 'runtime.onMessage fixTag',
          useCache: true,
        })
      }

      break
    }
    case EXTENSION_MSG_ID.UNFIX_TAG: {
      logIM('runtime.onMessage unfixTag');
      await unfixTag(message.parentId)

      const tabId = sender?.tab?.id;
      if (tabId == memo.activeTabId) {
        updateActiveTab({
          tabId,
          debugCaller: 'runtime.onMessage unfixTag',
          useCache: true,
        })
      }

      break
    }
    case EXTENSION_MSG_ID.ADD_RECENT_TAG: {
      logIM('runtime.onMessage ADD_RECENT_TAG');
      await addRecentTagFromView(message.bookmarkId)

      // const tabId = sender?.tab?.id;
      // if (tabId == memo.activeTabId) {
      //   updateActiveTab({
      //     tabId,
      //     debugCaller: 'runtime.onMessage ADD_RECENT_TAG',
      //     useCache: true,
      //   })
      // }

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_DATA: {
      logIM('runtime.onMessage OPTIONS_ASKS_DATA');

      const settings = await extensionSettings.get();
      browser.runtime.sendMessage({
        command: EXTENSION_MSG_ID.DATA_FOR_OPTIONS,
        HOST_LIST_FOR_PAGE_OPTIONS,
        USER_OPTION,
        settings,
      });

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_SAVE: {
      logIM('runtime.onMessage OPTIONS_ASKS_SAVE');
      await extensionSettings.update(message.updateObj)

      break
    }
    case EXTENSION_MSG_ID.OPTIONS_ASKS_FLAT_BOOKMARKS: {
      logIM('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

      let success

      try {
        await moveToFlatFolderStructure()
        success = true
      } catch (e) {
        logIM('IGNORE Error on flatting bookmarks', e);
      }

      browser.runtime.sendMessage({
        command: EXTENSION_MSG_ID.FLAT_BOOKMARKS_RESULT,
        success,
      });

      break
    }
    case EXTENSION_MSG_ID.ADD_BOOKMARK_FOLDER_BY_NAME: {
      logIM('runtime.onMessage ADD_BOOKMARK_FOLDER_BY_NAME', message.folderName);
      if (!message.folderName) {
        break
      }
      const folderName = message.folderName.trim()
      if (!folderName) {
        break
      }

      await addBookmarkFolderByName({
        url: message.url,
        title: message.title,
        folderName: folderName,
      })
      break
    }
  }
}
const logRC = makeLogFunction({ module: 'runtime.controller' })

const runtimeController = {
  async onStartup() {
    logRC('runtime.onStartup');

    await initExtension({ debugCaller: 'runtime.onStartup' })
    debouncedUpdateActiveTab({
      debugCaller: 'runtime.onStartup'
    });

    const savedObj = await getOptions([
      USER_OPTION.USE_FLAT_FOLDER_STRUCTURE,
    ]);

    if (savedObj[USER_OPTION.USE_FLAT_FOLDER_STRUCTURE]) {
      await flatBookmarks()
    }
  },
  async onInstalled () {
    logRC('runtime.onInstalled');

    await initExtension({ debugCaller: 'runtime.onInstalled' })
    debouncedUpdateActiveTab({
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logRC('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
const logSC = makeLogFunction({ module: 'storage.controller' })

const storageController = {
  
  onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const userOptionSet = new Set(USER_OPTION_STORAGE_KEY_LIST)
      const intersectSet = changesSet.intersection(userOptionSet)

      if (intersectSet.size > 0) {
        logSC('storage.onChanged', namespace, changes);

        extensionSettings.invalidate()
      }
    }
  },
};
const logTC = makeLogFunction({ module: 'tabs.controller' })

const tabsController = {
  // onCreated({ pendingUrl: url, index, id }) {
  //   logTC('tabs.onCreated', index, id, url);
  // },
  async onUpdated(tabId, changeInfo, Tab) {
    // logTC('tabs.onUpdated 00', 'tabId', tabId, 'Tab.index', Tab.index);
    // logTC('tabs.onUpdated 00 ------changeInfo', changeInfo);

    // if (changeInfo?.url) {
    //   if (tabId === memo.activeTabId) {
    //     if (memo.activeTabUrl != changeInfo.url) {
    //       memo.activeTabUrl = changeInfo.url
    //     }        
    //   }
    // }

    switch (changeInfo?.status) {
      case ('complete'): {
        logTC('tabs.onUpdated complete 00', 'tabId', tabId, 'memo.activeTabId', memo.activeTabId);
        logTC('tabs.onUpdated complete 00 -------Tab',Tab);
        
        if (tabId === memo.activeTabId) {
          logTC('tabs.onUpdated complete 11 tabId === memo.activeTabId');
          // we here after message page-is-ready. that message triggers update. not necessary to update here
          // no message ready in chrome, in the tab click on url
          const url = Tab.url

          if (url !== memo.activeTabUrl) {
            logTC('tabs.onUpdated complete 22 Tab.url !== memo.activeTabUrl');
            memo.activeTabUrl = url
            const cleanUrl = await clearUrlOnPageOpen({ tabId, url })
            updateActiveTab({
              tabId,
              url: cleanUrl,
              debugCaller: 'tabs.onUpdated complete',
            })       
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logTC('tabs.onActivated 00', 'memo[\'activeTabId\'] <=', tabId);

    // detect tab was changed
    // if (memo.activeTabId !== tabId) {
    //   memo.previousTabId = memo.activeTabId;
    //   memo.activeTabId = tabId;
    // }
    memo.activeTabId = tabId;

    updateActiveTab({
      tabId,
      debugCaller: 'tabs.onActivated'
    });

    try {
      const Tab = await browser.tabs.get(tabId);

      if (Tab) {
        logTC('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
      }
    } catch (er) {
      logTC('tabs.onActivated. IGNORING. tab was deleted', er);
    }
  },
  // // eslint-disable-next-line no-unused-vars
  // async onRemoved(tabId) {
  //   // deleteUncleanUrlBookmarkForTab(tabId)
  // }
}
const logWC = makeLogFunction({ module: 'windows.controller' })

const windowsController = {
  async onFocusChanged(windowId) {
    logWC('windows.onFocusChanged', windowId);
    
    if (0 < windowId) {
      logWC('windows.onFocusChanged', windowId);
      await setFirstActiveTab({ debugCaller: 'windows.onFocusChanged' })
      debouncedUpdateActiveTab({
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
browser.storage.onChanged.addListener(storageController.onChanged);

browser.bookmarks.onCreated.addListener(bookmarksController.onCreated);
browser.bookmarks.onMoved.addListener(bookmarksController.onMoved);
browser.bookmarks.onChanged.addListener(bookmarksController.onChanged);
browser.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

// listen for window switching
browser.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

// browser.tabs.onCreated.addListener(tabsController.onCreated);
browser.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
browser.tabs.onActivated.addListener(tabsController.onActivated);
// browser.tabs.onRemoved.addListener(tabsController.onRemoved);

browser.commands.onCommand.addListener(commandsController.onCommand);
browser.menus.onClicked.addListener(contextMenusController.onClicked); 

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
browser.runtime.onMessage.addListener(runtimeController.onMessage);