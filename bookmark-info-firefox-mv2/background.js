const LOG_CONFIG = {
  SHOW_LOG_CACHE: false,
  SHOW_LOG_EVENT_OUT: false,
  SHOW_LOG_EVENT_IN: false,
  SHOW_LOG_IGNORE: false,
  SHOW_LOG_OPTIMIZATION: false,
  SHOW_LOG_QUEUE: false,
  SHOW_LOG: false,
  SHOW_DEBUG: false,
  SHOW_SETTINGS: false,
}
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

const makeLogWithPrefix = (prefix = '') => {
  return function () {  
    const ar = Array.from(arguments);

    if (prefix) {
      ar.unshift(prefix);
    }

    logWithTime(...ar);
  }
}

const log = LOG_CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
const logCache = LOG_CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
const logSendEvent = LOG_CONFIG.SHOW_LOG_EVENT_OUT ? makeLogWithPrefix('SEND =>') : () => { };
const logEvent = LOG_CONFIG.SHOW_LOG_EVENT_IN ? makeLogWithPrefix('EVENT <=') : () => { };
const logIgnore = LOG_CONFIG.SHOW_LOG_IGNORE ? makeLogWithPrefix('IGNORE') : () => { };
const logOptimization = LOG_CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
const logPromiseQueue = LOG_CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
const logDebug = LOG_CONFIG.SHOW_DEBUG ? makeLogWithPrefix('DEBUG') : () => { };
const logSettings = LOG_CONFIG.SHOW_SETTINGS ? makeLogWithPrefix('SETTINGS') : () => { };
const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}

const BROWSER_SPECIFIC_OPTIONS = {
  MENU_CONTEXT: {
    [BROWSER_OPTIONS.CHROME]: ['all'],
    [BROWSER_OPTIONS.FIREFOX]: ['all','tab']
  },
  // TODO remove duplication for DEL_BTN_RIGHT_PADDING, LABEL_RIGHT_PADDING in context-script
  // ? can context script import file.js
  // OR insert to context-script on build
  DEL_BTN_RIGHT_PADDING: {
    [BROWSER_OPTIONS.CHROME]: '0.5ch',
    [BROWSER_OPTIONS.FIREFOX]: '1ch'
  },
  LABEL_RIGHT_PADDING: {
    [BROWSER_OPTIONS.CHROME]: '0.3ch',
    [BROWSER_OPTIONS.FIREFOX]: '0.6ch'
  }
}

const BROWSER = BROWSER_OPTIONS.FIREFOX;

const IS_BROWSER_CHROME = BROWSER === BROWSER_OPTIONS.CHROME;
const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;
const BROWSER_SPECIFIC = Object.fromEntries(
  Object.entries(BROWSER_SPECIFIC_OPTIONS)
    .map(([option, obj]) => [option, obj[BROWSER]])
);
// TODO remove duplication clearUrlTargetList in options/options.js
//  can options.js get clearUrlTargetList using sendMessage?
const clearUrlTargetList = [
  // TODO if we clean url on open then we loose check-in, check-out dates
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
      '/imdbpicks/',
    ] 
  },
  {
    hostname: 'udemy.com',  
    paths: [
      '/course/',
    ] 
  },
]
// TODO remove duplication of EXTENSION_COMMAND_ID, CONTENT_SCRIPT_COMMAND_ID in content-script
const EXTENSION_COMMAND_ID = {
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  FIX_TAG: 'FIX_TAG',
  UNFIX_TAG: 'UNFIX_TAG',
  TAB_IS_READY: 'TAB_IS_READY',
  SHOW_TAG_LIST: 'SHOW_TAG_LIST',
  OPTIONS_ASKS_DATA: 'OPTIONS_ASKS_DATA',
  DATA_FOR_OPTIONS: 'DATA_FOR_OPTIONS',
  OPTIONS_ASKS_FLAT_BOOKMARKS: 'OPTIONS_ASKS_FLAT_BOOKMARKS',
  FLAT_BOOKMARKS_RESULT: 'FLAT_BOOKMARKS_RESULT',
}

const CONTENT_SCRIPT_COMMAND_ID = {
  BOOKMARK_INFO: 'BOOKMARK_INFO',
  HISTORY_INFO: 'HISTORY_INFO',
  CLEAR_URL: 'CLEAR_URL',
}
const BASE_ID = 'BKM_INF';

const CONTEXT_MENU_ID = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  CLEAR_URL: `${BASE_ID}_CLEAR_URL`,
  // BOOKMARK_AND_CLOSE: `${BASE_ID}_BOOKMARK_AND_CLOSE`,
};
const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};
const STORAGE_TYPE = {
  LOCAL: 'LOCAL',
  SESSION: 'SESSION',
}

const SHOW_PREVIOUS_VISIT_OPTION = {
  NEVER: 0,
  ONLY_NO_BKM: 1,
  ALWAYS: 2,
}

const STORAGE_KEY_META = {
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
    default: SHOW_PREVIOUS_VISIT_OPTION.ALWAYS,
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
}

const STORAGE_KEY = Object.fromEntries(
  Object.keys(STORAGE_KEY_META).map((key) => [key, key])
)

const ADD_BOOKMARK_LIST_MAX = 50

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
    logCache(`   ${this.name}.add: ${key}`, value);
    
    this.removeStale();
  }
  
  get(key) {
    const value = this.cache.get(key);
    logCache(`   ${this.name}.get: ${key}`, value);
  
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    logCache(`   ${this.name}.delete: ${key}`);
  }
  
  clear() {
    this.cache.clear();
    logCache(`   ${this.name}.clear()`);
  }

  has(key) {
    return this.cache.has(key);
  }

  print() {
    logCache(this.cache);
  }
}
class PromiseQueue {
  constructor () {
    this.promise = {};
    this.tasks = {};
  }

  async continueQueue(key, prevResult) {
    // console.log('this.tasks[key]', this.tasks[key]);
    const task = this.tasks[key]?.shift()

    if (task) {
      const isActual = prevResult?.taskName === task.taskName  
        && prevResult?.url === task.options.url
        && prevResult?.source === SOURCE.ACTUAL;
      logPromiseQueue('task', task);
      logPromiseQueue('prevResult', prevResult);
      logPromiseQueue('isActual', isActual);

      if (!isActual) {
        logPromiseQueue(' PromiseQueue: exec task', key, task.options);
        return task.fn(task.options)
          .catch((er) => {
            logIgnore(' IGNORING error: PromiseQueue', er);
            return this.continueQueue(key);
          })
          .then((result) => (
            this.continueQueue(
              key,
              {
                ...result,
                taskName: task.taskName,
                url: task.options.url,
              }
            )
          ));
      } else {
        logPromiseQueue(' PromiseQueue: exec task, skip : source actual', key, task.options);
        return this.continueQueue(key, prevResult);
      }
    } else {
      logPromiseQueue(' PromiseQueue: finish', key)
      delete this.tasks[key];
      delete this.promise[key];

      return prevResult;
    }
  }

  add ({ key, fn, options }) {
    const taskName = fn.name;

    if (!this.tasks[key]) {
      logPromiseQueue(' PromiseQueue: start', key, options)
      this.tasks[key] = [{ fn, options, taskName }]
      this.promise[key] = this.continueQueue(key);
    } else {
      logPromiseQueue(' PromiseQueue: add task', key, options)
      this.tasks[key].push({ fn, options, taskName })
    }
  }
}

const promiseQueue = new PromiseQueue();
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
const EMPTY_FOLDER_NAME_LIST = [
  'New folder',
  '[Folder Name]',
]

const emptyFolderNameSet = new Set(EMPTY_FOLDER_NAME_LIST)

async function getRecentList(nItems) {
  log('getRecentTagObj() 00', nItems)
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

  const unknownFolderList = await browser.bookmarks.get(unknownIdList)
  unknownFolderList.forEach(({ id, title }) => {
    folderByIdMap[id].title = title
  })

  return Object.entries(folderByIdMap)
    .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
    .filter(({ title }) => !emptyFolderNameSet.has(title))
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
}

async function getRecentTagObj(nItems) {
  let list = await getRecentList(nItems * 4)

  if (list.length < nItems) {
    list = await getRecentList(nItems * 10)
  }

  return Object.fromEntries(
    list
      .slice(0, nItems)
      .map(({ parentId, title, dateAdded }) => [parentId, { title, dateAdded }])
  )
}

async function filterRecentTagObj(inObj = {}) {
  const idList = Object.keys(inObj)

  if (idList.length === 0) {
    return {}
  }

  const folderList = await browser.bookmarks.get(idList)
  const filteredFolderList = folderList
    .filter(Boolean)
    .filter(({ title }) => !!title)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [
      id, 
      {
        title, 
        dateAdded: inObj[id].dateAdded,
      }
    ])
  )
}

async function filterFixedTagObj(obj = {}) {
  const idList = Object.keys(obj)

  if (idList.length === 0) {
    return {}
  }

  const folderList = await browser.bookmarks.get(idList)
  const filteredFolderList = folderList
    .filter(Boolean)
    .filter(({ title }) => !!title)

  return Object.fromEntries(
    filteredFolderList.map(({ id, title }) => [id, title])
  )
}
const targetMap = new Map(
  clearUrlTargetList.map(({ hostname, paths }) => [hostname, paths])
)

const getHostBase = (str) => str.split('.').slice(-2).join('.')

const removeQueryParamsIfTarget = (url) => {
  let cleanUrl = url
  let isPattern = false

  try {
    const oLink = new URL(url);
    const { hostname, pathname } = oLink;
    const targetPathList = targetMap.get(getHostBase(hostname))

    if (targetPathList && targetPathList.some((targetPath) => pathname.startsWith(targetPath))) {
      isPattern = true
      oLink.search = ''

      cleanUrl = oLink.toString();  
    }
  
  /* eslint-disable no-unused-vars */
  // eslint-disable-next-line no-empty
  } catch (_e) {
    
  }
  /* eslint-enable no-unused-vars */

  return {
    cleanUrl,
    isPattern,
  }
}

const removeQueryParams = (link) => {
  try {
    const oLink = new URL(link);
    oLink.search = ''
  
    return oLink.toString();  
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return link
  }
}

// let testStr = "https://www.linkedin.com/jobs/view/3920634940/?alternateChannel=search&refId=dvaqme%2FfxHehSAa5o4nVnA%3D%3D&trackingId=8%2FZKaGcTAInuTTH4NyKDoA%3D%3D"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://www.youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))

// testStr = "https://youtu.be/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test ', removeQueryParamsIfTarget(testStr))
//
// https://career.proxify.io/apply?uuid=566c933b-432e-64e0-b317-dd4390d6a74e&step=AdditionalInformation

async function clearUrlInTab({ tabId, cleanUrl }) {
  const msg = {
    command: CONTENT_SCRIPT_COMMAND_ID.CLEAR_URL,
    cleanUrl,
  }
  logSendEvent('clearUrlInTab()', tabId, msg)
  await browser.tabs.sendMessage(tabId, msg)
    .catch((err) => {
      logIgnore('clearUrlInTab()', err)
    })
}
// TODO did can we not create menu on evert time
async function createContextMenu() {
  await browser.menus.removeAll();

  browser.menus.create({
    id: CONTEXT_MENU_ID.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  browser.menus.create({
    id: CONTEXT_MENU_ID.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url',
  });
  // TODO? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  browser.menus.create({
    id: CONTEXT_MENU_ID.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });
  // TODO? bookmark and close tabs (tabs without bookmarks)
}
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

  logDebug('setOptions localObj', localObj)
  logDebug('setOptions sessionObj', sessionObj)
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
// console.log('IMPORTING', 'memo.js')
const memo = {
  activeTabId: '',
  activeTabUrl: '',
  previousTabId: '',
  isActiveTabBookmarkManager: false,
  // previousActiveTabId: '',
  cacheUrlToInfo: new CacheWithLimit({ name: 'cacheUrlToInfo', size: 150 }),
  cacheUrlToVisitList: new CacheWithLimit({ name: 'cacheUrlToVisitList', size: 150 }),
  bkmFolderById: new CacheWithLimit({ name: 'bkmFolderById', size: 200 }),
  // tabId -> bookmarkId
  tabMap: new Map(),
  // isRemovingOnlyUncleanUrlBookmarkSet: new Set(),

  _isSettingsActual: false,
  get isSettingsActual() {
    return this._isSettingsActual
  },
  invalidateSettings () {
    this._isSettingsActual = false
  },
  _settings: {},
  async readSettings() {
    if (!this._isSettingsActual) {
      logSettings('readSavedSettings START')

      this._settings = await getOptions([
        STORAGE_KEY.CLEAR_URL,
        STORAGE_KEY.SHOW_PATH_LAYERS,
        STORAGE_KEY.SHOW_PREVIOUS_VISIT,
        STORAGE_KEY.SHOW_BOOKMARK_TITLE,
        STORAGE_KEY.ADD_BOOKMARK_IS_ON,
        STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
        STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
        STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH,
      ]);
      logSettings('readSavedSettings')
      logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  

      await this.readTagList()

      this._isSettingsActual = true
    }
  },
  get settings() {
    return { ...this._settings }
  },
  async updateShowTagList(value) {
    this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW] = value
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW]: value
    })
  },

  _profileStartTimeMS: undefined,
  get profileStartTimeMS() {
    return this._profileStartTimeMS
  },
  _isProfileStartTimeMSActual: false,
  get isProfileStartTimeMSActual() {
    return this._isProfileStartTimeMSActual
  },
  async readProfileStartTimeMS() {
    if (!this._isProfileStartTimeMSActual) {

      const storedSession = await getOptions(STORAGE_KEY.START_TIME)
      logSettings('storedSession', storedSession)

      if (storedSession[STORAGE_KEY.START_TIME]) {
        this._profileStartTimeMS = storedSession[STORAGE_KEY.START_TIME]
      } else {
        // I get start for service-worker now.
        //    It is correct if this web-extension was installed in the previous browser session
        // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
        //  tab with minimal tabId
        this._profileStartTimeMS = performance.timeOrigin
        await setOptions({
          [STORAGE_KEY.START_TIME]: this._profileStartTimeMS
        })

      }

      logSettings('profileStartTimeMS', new Date(this._profileStartTimeMS).toISOString())
      this._isProfileStartTimeMSActual = true
    }
  },

  _recentTagObj: {},
  _fixedTagObj: {},
  _tagList: [],
  get tagList() {
    return this._tagList
  },
  getTagList() {
    const recentTaLimit = Math.max(
      this._settings[STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT] - Object.keys(this._fixedTagObj).length,
      0
    )

    const recentTagList = Object.entries(this._recentTagObj)
      .filter(([parentId]) => !(parentId in this._fixedTagObj))
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, recentTaLimit)
    
    const fullList = [].concat(
      recentTagList
        .map(({ parentId, title }) => ({ parentId, title, isFixed: false })),
      Object.entries(this._fixedTagObj)
        .map(([parentId, title]) => ({ parentId, title, isFixed: true }))
    )

    return fullList
      .filter(({ title }) => !!title)
      .sort(({ title: a }, { title: b }) => a.localeCompare(b))
  },
  async readTagList() {
    logSettings('readTagList 11')

    if (this._settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      logSettings('readTagList 22')
      const savedObj = await getOptions([
        STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED,
        STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP,
        STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP,
      ]);

      if (!savedObj[STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED]) {
        const actualRecentTagObj = await getRecentTagObj(ADD_BOOKMARK_LIST_MAX)
        const storedRecentTagObj = await filterRecentTagObj(savedObj[STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP])
        this._recentTagObj = {
          ...storedRecentTagObj,
          ...actualRecentTagObj,
        }
        this._fixedTagObj = await filterFixedTagObj(savedObj[STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP])

        await setOptions({
          [STORAGE_KEY.ADD_BOOKMARK_SESSION_STARTED]: true,
          [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj,
        })
      } else {
        this._recentTagObj = savedObj[STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP] 
        this._fixedTagObj = savedObj[STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]
      }

      logSettings('readTagList this._recentTagObj ', this._recentTagObj)
      this._tagList = this.getTagList()
      logSettings('readTagList this._tagList ', this._tagList)
    } else {
      logSettings('readTagList 44')

      this._recentTagObj = {}
      this._fixedTagObj = {}
      this._tagList = []
    }
  },
  async addRecentTag(bkmNode) {
    let newFolderId
    let newFolder

    if (bkmNode.id && !bkmNode.url) {
      newFolderId = bkmNode.id
      newFolder = bkmNode
    } else {
      newFolderId = bkmNode.parentId;
      ([newFolder] = await browser.bookmarks.get(newFolderId))
    }

    const dateAdded = bkmNode.dateAdded || Date.now()

    if (emptyFolderNameSet.has(newFolder.title)) {
      return
    }

    this._recentTagObj[newFolderId] = {
      dateAdded,
      title: newFolder.title
    }

    if (ADD_BOOKMARK_LIST_MAX + 10 < Object.keys(this._recentTagObj).length) {
      const redundantIdList = Object.entries(this._recentTagObj)
        .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
        .sort((a,b) => -(a.dateAdded - b.dateAdded))
        .slice(ADD_BOOKMARK_LIST_MAX)
        .map(({ parentId }) => parentId)

        redundantIdList.forEach((id) => {
          delete this._recentTagObj[id]
        })
    }

    this._tagList = this.getTagList()
    setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
    })
  },
  async removeTag(id) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      delete this._fixedTagObj[id] 
      fixedTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      delete this._recentTagObj[id]
      recentTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  },
  async updateTag(id, title) {
    const isInFixedList = id in this._fixedTagObj
    let fixedTagUpdate

    if (isInFixedList) {
      this._fixedTagObj[id] = title
      fixedTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      }
    }

    const isInRecentList = id in this._recentTagObj
    let recentTagUpdate

    if (isInRecentList) {
      this._recentTagObj[id].title = title
      recentTagUpdate = {
        [STORAGE_KEY.ADD_BOOKMARK_RECENT_MAP]: this._recentTagObj
      }
    }

    if (isInFixedList || isInRecentList) {
      this._tagList = this.getTagList()
      await setOptions({
        ...fixedTagUpdate,
        ...recentTagUpdate,
      })
    }
  },
  async addFixedTag({ parentId, title }) {
    if (!title || !parentId) {
      return
    }

    if (!(parentId in this._fixedTagObj)) {
      this._fixedTagObj[parentId] = title

      this._tagList = this.getTagList()
      await setOptions({
        [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
      })
    }
  },
  async removeFixedTag(id) {
    delete this._fixedTagObj[id]

    this._tagList = this.getTagList()
    await setOptions({
      [STORAGE_KEY.ADD_BOOKMARK_FIXED_MAP]: this._fixedTagObj
    })
  },

  activeDialog: {},
  activeDialogTabId: undefined,
  activeDialogTabOnActivated (tabId) {
    if (tabId !== this.activeDialogTabId)  {
      this.activeDialogTabId = tabId
      this.activeDialog = {}
    }
  },
  createBkmInActiveDialog (bookmarkId, parentId) {
    const isFirst = Object.values(this.activeDialog).filter(({ bookmarkId }) => bookmarkId).length === 0;
    this.activeDialog[parentId] = {
      ...this.activeDialog[parentId],
      bookmarkId,
      isFirst,
    }

    return this.activeDialog[parentId]
  },
  createBkmInActiveDialogFromTag (parentId) {
    this.activeDialog[parentId] = {
      fromTag: true
    }
  },
  isCreatedInActiveDialog(bookmarkId, parentId) {
    const result = this.activeDialog[parentId]?.bookmarkId === bookmarkId 
      && this.activeDialog[parentId]?.isFirst === true
      && this.activeDialog[parentId]?.fromTag !== true

    // logDebug('isCreatedInActiveDialog 1', result)
    // logDebug('isCreatedInActiveDialog 2', this.activeDialog[parentId])

    return result
  },
  removeFromActiveDialog(parentId) {
    delete this.activeDialog[parentId]
  }
};

logSettings('IMPORT END', 'memo.js', new Date().toISOString())
async function isHasBookmark(url) {
  const bookmarks = await browser.bookmarks.search({ url });

  return bookmarks.length > 0;
}

async function deleteBookmark(bkmId) {
  await browser.bookmarks.remove(bkmId);
}

async function deleteUncleanUrlBookmarkForTab(tabId) {
  log('deleteUncleanUrlBookmarkForTab 00 tabId', tabId)
  if (!tabId) {
    return
  }

  const tabData = memo.tabMap.get(tabId)
  log('deleteUncleanUrlBookmarkForTab 11 tabData', tabData)

  if (tabData?.bookmarkId) {
    log('deleteUncleanUrlBookmarkForTab 22')
    await browser.bookmarks.remove(tabData.bookmarkId)
    memo.tabMap.delete(tabId)
  }
}

const getParentIdList = (bookmarkList) => {
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
  const bookmarkList = await browser.bookmarks.search({ url });

  if (bookmarkList.length == 0) {
    return [];
  }

  await addBookmarkParentInfo(bookmarkList, memo.bkmFolderById)

  return bookmarkList
    .map((bookmarkItem) => {
      const fullPathList = getFullPath(bookmarkItem.parentId, memo.bkmFolderById)

      return {
        id: bookmarkItem.id,
        fullPathList,
        title: bookmarkItem.title,
        parentId: bookmarkItem.parentId,
      }
    });
}

async function getBookmarkInfoUni({ url, useCache=false }) {
  if (!url || !isSupportedProtocol(url)) {
    return;
  }

  let bookmarkInfoList;
  let source;

  if (useCache) {
    bookmarkInfoList = memo.cacheUrlToInfo.get(url);
    
    if (bookmarkInfoList) {
      source = SOURCE.CACHE;
      logOptimization(' getBookmarkInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!bookmarkInfoList) {
    bookmarkInfoList = await getBookmarkInfo(url);
    source = SOURCE.ACTUAL;
    memo.cacheUrlToInfo.add(url, bookmarkInfoList);
  }

  return {
    bookmarkInfoList,
    source,
  };
}
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

    if (mostNewVisitMS && mostNewVisitMS > memo.profileStartTimeMS) {
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
  let rootUrl

  if (memo.settings[STORAGE_KEY.CLEAR_URL]) {
    const { cleanUrl, isPattern } = removeQueryParamsIfTarget(url)

    if (isPattern) {
      rootUrl = cleanUrl
    }
  } 

  if (rootUrl) {
    const historyItemList = (await browser.history.search({
      text: rootUrl,
      maxResults: 10,
    }))
      .filter((i) => i.url && i.url.startsWith(rootUrl))

    return getVisitListForUrlList(historyItemList.map(i => i.url))
  } else {
    return getVisitListForUrl(url)
  }
}

async function getHistoryInfo({ url, useCache=false }) {
  const showPreviousVisit = memo.settings[STORAGE_KEY.SHOW_PREVIOUS_VISIT]
  
  if (!(showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ALWAYS || showPreviousVisit === SHOW_PREVIOUS_VISIT_OPTION.ONLY_NO_BKM)) {
    return {
      visitList: [],
      source: SOURCE.ACTUAL,
    }
  }

  let visitList;
  let source;

  if (useCache) {
    visitList = memo.cacheUrlToVisitList.get(url);
    
    if (visitList) {
      source = SOURCE.CACHE;
      logOptimization(' getHistoryInfoUni: from cache bookmarkInfo')
    }
  } 
  
  if (!visitList) {
    const allVisitList = await getPreviousVisitList(url);
    visitList = filterTimeList(allVisitList)
    source = SOURCE.ACTUAL;
    memo.cacheUrlToVisitList.add(url, visitList);
  }

  return {
    visitList,
    source,
  };
}
async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  let actualUrl = url

  if (memo.settings[STORAGE_KEY.CLEAR_URL]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  const usedParentIdSet = new Set(bookmarkInfo.bookmarkInfoList.map(({ parentId }) => parentId))

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.BOOKMARK_INFO,
    bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
    showLayer: memo.settings[STORAGE_KEY.SHOW_PATH_LAYERS],
    isShowTitle: memo.settings[STORAGE_KEY.SHOW_BOOKMARK_TITLE],
    tagList: memo.tagList.map(({ parentId, title, isFixed }) => ({
      parentId,
      title, 
      isFixed,
      isUsed: usedParentIdSet.has(parentId)
    })),
    isShowTagList: memo.settings[STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW],
    tagLength: memo.settings[STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH],
  }
  logSendEvent('updateBookmarksForTabTask()', tabId, message);
  await browser.tabs.sendMessage(tabId, message)
  
  return bookmarkInfo
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: CONTENT_SCRIPT_COMMAND_ID.HISTORY_INFO,
    showPreviousVisit: memo.settings[STORAGE_KEY.SHOW_PREVIOUS_VISIT],
    visitList: visitInfo.visitList,
  }
  logSendEvent('updateVisitsForTabTask()', tabId, message);
  
  return browser.tabs.sendMessage(tabId, message)
    .then(() => visitInfo);
}

async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {

    await Promise.all([
      !memo.isProfileStartTimeMSActual && memo.readProfileStartTimeMS(),
      !memo.isSettingsActual && memo.readSettings(),
    ])

    log(`${debugCaller} -> updateTab() useCache`, useCache);
    promiseQueue.add({
      key: `${tabId}-bkm`,
      fn: updateBookmarksForTabTask,
      options: {
        tabId,
        url,
        useCache
      },
    });
    promiseQueue.add({
      key: `${tabId}-visits`,
      fn: updateVisitsForTabTask,
      options: {
        tabId,
        url,
        useCache
      },
    });
  }
}

async function updateActiveTab({ useCache=false, debugCaller } = {}) {
  logEvent(' updateActiveTab() 00')

  if (!memo.activeTabId) {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const [Tab] = tabs;

    if (Tab) {
      memo.activeTabId = Tab.id
      memo.activeTabUrl = Tab.url
      memo.isActiveTabBookmarkManager = (Tab.url && Tab.url.startsWith('chrome://bookmarks'));
    }
  }

  if (memo.activeTabId && memo.activeTabUrl) {   
    updateTab({
      tabId: memo.activeTabId, 
      url: memo.activeTabUrl, 
      useCache,
      debugCaller: `${debugCaller} -> updateActiveTab()`
    });
  }
}
async function getDuplicatesTabs(inTabList) {
  const tabList = inTabList.toReversed();
  const duplicateTabIdList = [];
  const uniqUrls = new Map();
  let activeTabId;
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
      activeTabId = Tab.id;
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
    activeTabId,
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

  return {
    tabWithBookmarkIdList: tabIdAndUrlList
      .filter(({ url }) => urlWithBookmarkSet.has(url))
      .map(({ tabId }) => tabId),
  }
}

async function closeBookmarkedTabs() {
  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const tabsWithId = tabs.filter(({ id }) => id);
  
  const {
    duplicateTabIdList,
    newActiveTabId,
  } = await getDuplicatesTabs(tabsWithId);

  const duplicateIdSet = new Set(duplicateTabIdList);
  const {
    tabWithBookmarkIdList,
  } = await getTabsWithBookmark(
    tabsWithId
      .filter((Tab) => !duplicateIdSet.has(Tab.id))
  );

  const closeTabIdList = duplicateTabIdList.concat(tabWithBookmarkIdList);
  if (closeTabIdList.length === tabs.length) {
    // do not close all tabs. It will close window.
    await browser.tabs.create({ index: 0 });
  }

  await Promise.all([
    newActiveTabId && browser.tabs.update(newActiveTabId, { active: true }),
    closeTabIdList.length > 0 && browser.tabs.remove(closeTabIdList),
  ])
}
let BOOKMARKS_BAR_ID = '1'
let OTHER_BOOKMARKS_ID = '2'

if (IS_BROWSER_FIREFOX) {
  BOOKMARKS_BAR_ID = 'toolbar_____'
  OTHER_BOOKMARKS_ID = 'unfiled_____'
}

const nestedRootTitle = 'yy-bookmark-info--nested'
const unclassifiedTitle = 'unclassified'

function getMaxUsedSuffix(folderById) {
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

function getFoldersFromTree(tree) {
  const folderById = {};
  let nTotalBookmark = 0
  let nTotalFolder = 0

  function getFoldersFromNodeArray (nodeArray) {
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
          parentId: node.parentId,
          node,
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

async function flatFolders({ nestedRootId, unclassifiedId, freeSuffix }) {
  const bookmarksBarChildrenList = await browser.bookmarks.getChildren(BOOKMARKS_BAR_ID)
  await Promise.all(
    bookmarksBarChildrenList
      .filter(({ url }) => !url)
      .map((node) => browser.bookmarks.move(node.id, { parentId: OTHER_BOOKMARKS_ID }))
  ) 

  const notFlatFolderList = []
  const flatFolderList = []
  const rootBookmarkList = []

  const [otherBookmarks] = await browser.bookmarks.getSubTree(OTHER_BOOKMARKS_ID)

  for (const node of otherBookmarks.children) {
    if (!node.url) {
      const childrenFolderList = node.children.filter(({ url }) => !url)

      if (node.id !== nestedRootId) {
        if (childrenFolderList.length > 0) {
          notFlatFolderList.push(node)
        } else {
          // flatFolderNameSet.add(node.title)
          flatFolderList.push(node)
        }
      }
    } else {
      rootBookmarkList.push(node.id)
    }
  }

  if (rootBookmarkList.length > 0) {
    await Promise.all(rootBookmarkList.map(
      (id) => browser.bookmarks.move(id, { parentId: unclassifiedId })
    ))    
  }

  // let order = 0
  const toCopyFolderById = {}
  const flatFolderNameSet = new Set()

  async function flatFolder(rootFolder) {
    async function traverseSubFolder(folderNode, folderLevel) {
      // order += 1
      toCopyFolderById[folderNode.id] = {
        id: folderNode.id,
        parentId: folderNode.parentId,
        title: folderNode.title,
        folderLevel,
        // order,
      }
      const folderList = folderNode.children
        .filter(({ url }) => !url)
      const bookmarkList = folderNode.children
        .filter(({ url }) => !!url)

      await Promise.all(folderList.map(
        (node) => traverseSubFolder(node, folderLevel + 1)
      ))

      if (folderLevel > 0 && bookmarkList.length > 0) {
        await browser.bookmarks.move(folderNode.id, { parentId: OTHER_BOOKMARKS_ID })

        if (flatFolderNameSet.has(folderNode.title)) {
          const newTitle = `${folderNode.title} ${freeSuffix}`
          freeSuffix += 1

          await browser.bookmarks.update(folderNode.id, {
            title: newTitle,
          })
          toCopyFolderById[folderNode.id].newTitle = newTitle
          flatFolderNameSet.add(newTitle)
        } else {
          flatFolderNameSet.add(folderNode.title)
        }
      }
    }

    await traverseSubFolder(rootFolder, 0)
  }

  // flat
  await Promise.all(notFlatFolderList.map(
    (node) => flatFolder(node)
  )) 

  // prefer change name for flat folder than for nested folder
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
  await Promise.all(updateTaskList.map(
    ({ id, title }) => browser.bookmarks.update(id, { title })
  )) 

  return { toCopyFolderById }
}

async function moveLinksFromNestedRoot({ nestedRootId, unclassifiedId }) {
  const [nestedRoot] = await browser.bookmarks.getSubTree(nestedRootId)
  const rootBookmarkList = []
  const folderList = []

  for (const node of nestedRoot.children) {
    if (!node.url) {
      folderList.push(node)
    } else {
      rootBookmarkList.push(node.id)
    }
  }

  if (rootBookmarkList.length > 0) {
    await Promise.all(rootBookmarkList.map(
      (id) => browser.bookmarks.move(id, { parentId: unclassifiedId })
    ))    
  }

  const toMoveFolder = []

  async function traverseFolder(folderNode) {
    // order += 1

    const folderList = folderNode.children
      .filter(({ url }) => !url)
    const bookmarkList = folderNode.children
      .filter(({ url }) => !!url)
      .map(({ id }) => id)

    if (bookmarkList.length > 0) {
      toMoveFolder.push({
        id: folderNode.id,
        title: folderNode.title,
        bookmarkList
      })
    }
    
    await Promise.all(folderList.map(
      (node) => traverseFolder(node)
    ))
  }

  await Promise.all(folderList.map(
    (node) => traverseFolder(node)
  )) 

  const otherBookmarksChildrenList = await browser.bookmarks.getChildren(OTHER_BOOKMARKS_ID)
  const flatFolderNameToIdMap = Object.fromEntries(
    otherBookmarksChildrenList
      .filter((node) => !node.url)
      .filter((node) => node.id !== nestedRootId)
      .map(({ id, title }) => [title, id])
  )

  async function moveBookmarks({ title, bookmarkList }) {
    let parentId = flatFolderNameToIdMap[title]

    if (!parentId) {
      const createdItem = await browser.bookmarks.create({
        parentId: OTHER_BOOKMARKS_ID,
        title
      })
      parentId = createdItem.id
    }

    await Promise.all(
      bookmarkList.map((id) => browser.bookmarks.move(id, { parentId }))
    )
  }

  await Promise.all(
    toMoveFolder.map(moveBookmarks)
  )
} 

async function createNestedFolders({ toCopyFolderById, nestedRootId }) {
  const oldToNewIdMap = {
    [OTHER_BOOKMARKS_ID]: nestedRootId,
  }
  const childrenMap = {}

  async function getAllChildrenByTitle(id) {
    const folderList = []
  
    function getFoldersFromNodeArray (nodeArray) {
      nodeArray.forEach((node) => {
        if (!node.url) {
          folderList.push({
            id: node.id,
            title: node.title,
          })
  
          getFoldersFromNodeArray(node.children)
        }
      });
    }
  
    const [rootNode] = await browser.bookmarks.getSubTree(id)
    getFoldersFromNodeArray(rootNode.children);
  
    return Object.fromEntries(
      folderList
        .map(({ title, id }) => [title, id])
    )
  }
  async function findOrCreateFolder({ id, title, newTitle, parentId }) {
    const newParentId = oldToNewIdMap[parentId]

    if (!childrenMap[newParentId]) {
      // childrenMap[newParentId] = browser.bookmarks.getChildren(newParentId)
      //   .then((nodes) => Object.fromEntries(
      //     nodes
      //       .filter(({ url }) => !url)
      //       .map(({ title, id }) => [title, id])
      //   ))
      childrenMap[newParentId] = getAllChildrenByTitle(newParentId)
    }
    const children = await childrenMap[newParentId]
    let newId = children[title]

    if (!newId) {
      const newNode = await browser.bookmarks.create({
        parentId: newParentId,
        title: newTitle || title
      })
      newId = newNode.id
    }

    oldToNewIdMap[id] = newId
  }

  // group by level
  const folderByLevelMap = new ExtraMap()
  Object.values(toCopyFolderById).forEach((item) => {
    folderByLevelMap.concat(item.folderLevel, item)
  })

  const sortedLevelList = Array.from(folderByLevelMap.keys())
    .toSorted((a,b) => a - b)

  for (const level of sortedLevelList) {
    const list = folderByLevelMap.get(level)
    await Promise.all(list.map(findOrCreateFolder))
  }
}

async function updateNestedFolders({ nestedRootId }) {
  const otherBookmarksChildrenList = await browser.bookmarks.getChildren(OTHER_BOOKMARKS_ID)
  const flatFolderNameSet = new Set(
    otherBookmarksChildrenList
      .filter((node) => !node.url)
      .filter((node) => node.id !== nestedRootId)
      .map(({ title }) => title)
  )

  const nestedFolderList = []
  
  function getFoldersFromNodeArray (nodeArray, level) {
    nodeArray.forEach((node) => {
      if (!node.url) {
        nestedFolderList.push({
          id: node.id,
          title: node.title,
          level,
        })

        getFoldersFromNodeArray(node.children, level + 1)
      }
    });
  }

  const [rootNode] = await browser.bookmarks.getSubTree(nestedRootId)
  getFoldersFromNodeArray(rootNode.children, 0);

  // nestedFolderList.sort(({ level: a}, { level: b }) => -(a - b))

  const taskList = nestedFolderList
    .filter(({ title }) => !flatFolderNameSet.has(title))

  // group by level
  const folderByLevelMap = new ExtraMap()
  Object.values(taskList).forEach((item) => {
    folderByLevelMap.concat(item.level, item)
  })

  const sortedLevelList = Array.from(folderByLevelMap.keys())
    .toSorted((a,b) => -(a - b))

  async function removeFolder(id) {
    const children = browser.bookmarks.getChildren(id)

    if (children.length === 0) {
      await browser.bookmarks.remove(id)
    }
  }

  for (const level of sortedLevelList) {
    const list = folderByLevelMap.get(level)
    await Promise.all(list.map(
      ({ id }) => removeFolder(id))
    )
  }
}

async function sortChildren({ id, recursively = false }) {
  const nodeList = await browser.bookmarks.getChildren(id)

  const sortedList = nodeList
    .filter(({ url }) => !url)
    .map(({ id, index, title }) => ({ id, actualIndex: index, title }))
    .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))

  // for (let index = 0; index < sortedList.length; index += 1) {
  //   await browser.bookmarks.move(sortedList[index].id, { index })
  // }

  const STATE = {
    SKIP_AFTER_START: 'SKIP_AFTER_START',
    AFTER_MOVE: 'AFTER_MOVE',
    SKIP_AFTER_MOVE: 'SKIP_AFTER_MOVE'
  }

  let mMove = 0
  let state = STATE.SKIP_AFTER_START
  let index = 0
  let actualContinueIndex
  while (index < sortedList.length) {
    switch (state) {
      case STATE.SKIP_AFTER_START: {
        if (sortedList[index].actualIndex !== index) {
          await browser.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
        }
        break
      }
      case STATE.AFTER_MOVE: {
        const node = await browser.bookmarks.get(sortedList[index].id)

        if (node.index === index) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
        } else {
          await browser.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
        }
        break
      }
      case STATE.SKIP_AFTER_MOVE: {
        if (sortedList[index].actualIndex === actualContinueIndex - 1) {
          state = STATE.SKIP_AFTER_MOVE
          actualContinueIndex = sortedList[index].actualIndex
        } else {
          await browser.bookmarks.move(sortedList[index].id, { index })
          state = STATE.AFTER_MOVE
          mMove += 1
        }
        break
      }
    }

    index += 1
  }

  // console.log('Sorting mMove1 ', mMove);

  if (recursively) {
    await Promise.all(
      sortedList.map(
        ({ id }) => sortChildren({ id })
      )
    )
  }
}

// async function sortChildren2({ id, recursively = false }) {
//   const nodeList = await browser.bookmarks.getChildren(id)

//   const filteredList = nodeList
//     .filter(({ url }) => !url)
//     .map(({ id, title }) => ({ id, title }))

//   const sortIndex = Object.fromEntries(
//     filteredList
//       .toSorted(({ title: a }, { title: b }) => a.localeCompare(b))
//       .map(({ id }, index) => [id, index])
//   )
//   const actualList = filteredList.map(({ id }) => ({ id, order: sortIndex[id] }))

//   let mMove = 0
//   let index = 0
//   while (index < actualList.length) {
//     const { id, order } = actualList[index]

//     if (order < index) {
//       await browser.bookmarks.move(id, { index: order })
//       actualList.splice(index, 1);
//       actualList.splice(order, 0, { id, order });
//       mMove += 1

//       index = order + 1
//     } else if (index < order) {
//       await browser.bookmarks.move(id, { index: order })
//       actualList.splice(index, 1);
//       actualList.splice(order, 0, { id, order });
//       mMove += 1

//       // index += 1
//     } else {
//       index += 1
//     }
//   }

//   console.log('Sorting mMove2 ', mMove);
//   // folders 15, nMove2 132, error (one folder is not in order)

//   if (recursively) {
//     await Promise.all(
//       actualList.map(
//         ({ id }) => sortChildren({ id })
//       )
//     )
//   }
// }

async function flatBookmarks() {
  //1) get information: 
  //  folder has subfolders
  //  level
  // get last used suffix

  //2) move bookmarks to flat folders
  // from most deep

  //3) sort

  const bookmarkTree = await browser.bookmarks.getTree();
  const {
    folderById,
    // nTotalBookmark,
    // nTotalFolder,
  } = getFoldersFromTree(bookmarkTree);
  // console.log('nTotalFolder ', nTotalFolder)
  // console.log('nTotalBookmark ', nTotalBookmark)

  const usedSuffix = getMaxUsedSuffix(folderById)
  let freeSuffix = usedSuffix ? usedSuffix + 1 : 1;


  let nestedRootId
  const findItem = Object.values(folderById).find(({ title }) => title === nestedRootTitle)

  if (findItem) {
    nestedRootId = findItem.id
  } else {
    const createdItem = await browser.bookmarks.create({
      parentId: OTHER_BOOKMARKS_ID,
      title: nestedRootTitle
    })
    nestedRootId = createdItem.id
  }

  let unclassifiedId
  const findItem2 = Object.values(folderById).find(({ title }) => title === unclassifiedTitle)

  if (findItem2) {
    unclassifiedId = findItem2.id
  } else {
    const createdItem2 = await browser.bookmarks.create({
      parentId: OTHER_BOOKMARKS_ID,
      title: unclassifiedTitle
    })
    unclassifiedId = createdItem2.id
  }

  const { toCopyFolderById } = await flatFolders({ nestedRootId, unclassifiedId, freeSuffix })
  await moveLinksFromNestedRoot({ nestedRootId, unclassifiedId })
  await createNestedFolders({ toCopyFolderById, nestedRootId })

  // TODO ?delete empty folders

  // TODO ?delete from "Other bookmarks/yy-bookmark-info--nested" folders that was deleted from first level folders
  //await updateNestedFolders({ nestedRootId })

  await sortChildren({ id: OTHER_BOOKMARKS_ID })
  await sortChildren({ id: nestedRootId, recursively: true })
}
const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logEvent('bookmark.onCreated <-', node);

    let fromTag
    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      ({ fromTag } = memo.createBkmInActiveDialog(node.id, node.parentId))
      if (!fromTag) {
        await memo.addRecentTag(node)
      }
    }

    if (node.url) {
      if (node.url === memo.activeTabUrl) {
        // changes in active tab
        await updateActiveTab({
          debugCaller: 'bookmark.onCreated'
        });
      } else {
        // changes in bookmark manager
        getBookmarkInfoUni({ url: node.url });
      }
    }

    if (fromTag) {
      memo.addRecentTag(node)
    }
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);


    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON] && changeInfo.title) {
      await memo.updateTag(bookmarkId, changeInfo.title)
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    const [node] = await browser.bookmarks.get(bookmarkId)

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });        
  },
  async onMoved(bookmarkId, { oldIndex, index, oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-', { oldIndex, index, oldParentId, parentId });
    
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
    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      await memo.addRecentTag({ parentId });
    }

    // EPIC_ERROR if (parentId ==! oldParentId) {
    if (parentId !== oldParentId) {
      const [node] = await browser.bookmarks.get(bookmarkId)
      logDebug('bookmark.onMoved <-', node);

      if (!node.url) {
        memo.bkmFolderById.delete(bookmarkId);
      }

      const childrenList = await browser.bookmarks.getChildren(parentId)
      const lastIndex = childrenList.length - 1

      // changes in active tab or in bookmark manager
      if (index === lastIndex) {
        if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {

          if (memo.isCreatedInActiveDialog(bookmarkId, oldParentId)) {
            logDebug('bookmark.onMoved 11');
            memo.removeFromActiveDialog(oldParentId)
          } else if (oldParentId && !!node.url && IS_BROWSER_CHROME && !memo.isActiveTabBookmarkManager) {
            logDebug('bookmark.onMoved 22');
            await Promise.all([
              browser.bookmarks.create({
                parentId: oldParentId,
                title: node.title,
                url: node.url
              }),
              browser.bookmarks.remove(bookmarkId),
            ])
            await browser.bookmarks.create({
              parentId,
              title: node.title,
              url: node.url
            })
          }
          logDebug('bookmark.onMoved 33');
        }
  
        await updateActiveTab({
          debugCaller: 'bookmark.onMoved'
        });
      }

      // changes in bookmark manager
      getBookmarkInfoUni({ url: node.url });
    }

  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);

    if (memo.settings[STORAGE_KEY.ADD_BOOKMARK_IS_ON]) {
      memo.removeFromActiveDialog(node.parentId)
      
      if (!node.url) {
        await memo.removeTag(bookmarkId)
      }
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}
const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked <-');

    switch (OnClickData.menuItemId) {
      case CONTEXT_MENU_ID.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case CONTEXT_MENU_ID.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case CONTEXT_MENU_ID.CLEAR_URL: {
        const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;

        if (activeTab?.id && activeTab?.url) {
          const cleanUrl = removeQueryParams(activeTab.url);

          if (activeTab.url !== cleanUrl) {
            await clearUrlInTab({ tabId: activeTab.id, cleanUrl })
          }
        }

        break;
      }
    }
  }
}
async function onIncomingMessage (message, sender) {
  switch (message?.command) {

    case EXTENSION_COMMAND_ID.TAB_IS_READY: {
      const tabId = sender?.tab?.id;
      logEvent('runtime.onMessage contentScriptReady', tabId);

      if (tabId) {
        const url = message.url
        let cleanUrl

        if (memo.settings[STORAGE_KEY.CLEAR_URL]) {
          ({ cleanUrl } = removeQueryParamsIfTarget(url));
          
          if (url !== cleanUrl) {
            await clearUrlInTab({ tabId, cleanUrl })
          }
        }

        updateTab({
          tabId,
          url: cleanUrl || url,
          useCache: true,
          debugCaller: 'runtime.onMessage contentScriptReady',
        })
      }

      break
    }
    case EXTENSION_COMMAND_ID.ADD_BOOKMARK: {
      logEvent('runtime.onMessage addBookmark');
      memo.createBkmInActiveDialogFromTag(message.parentId)
      await browser.bookmarks.create({
        index: 0,
        parentId: message.parentId,
        title: message.title,
        url: message.url
      })

      break
    }
    case EXTENSION_COMMAND_ID.DELETE_BOOKMARK: {
      logEvent('runtime.onMessage deleteBookmark');

      deleteBookmark(message.bkmId);
      break
    }
    case EXTENSION_COMMAND_ID.SHOW_TAG_LIST: {
      logEvent('runtime.onMessage SHOW_RECENT_LIST');

      await memo.updateShowTagList(message.value)
      // updateActiveTab({
      //   debugCaller: 'runtime.onMessage SHOW_RECENT_LIST',
      //   useCache: true,
      // });

      break
    }
    case EXTENSION_COMMAND_ID.FIX_TAG: {
      logEvent('runtime.onMessage fixTag');

      await memo.addFixedTag({
        parentId: message.parentId,
        title: message.title,
      })
      updateActiveTab({
        debugCaller: 'runtime.onMessage fixTag',
        useCache: true,
      });
  
      break
    }
    case EXTENSION_COMMAND_ID.UNFIX_TAG: {
      logEvent('runtime.onMessage unfixTag');

      await memo.removeFixedTag(message.parentId)
      updateActiveTab({
        debugCaller: 'runtime.onMessage unfixTag',
        useCache: true,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_DATA: {
      logEvent('runtime.onMessage OPTIONS_ASKS_DATA');

      browser.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.DATA_FOR_OPTIONS,
        clearUrlTargetList,
        STORAGE_TYPE,
        STORAGE_KEY_META,
        STORAGE_KEY,
      });

      break
    }
    case EXTENSION_COMMAND_ID.OPTIONS_ASKS_FLAT_BOOKMARKS: {
      logEvent('runtime.onMessage OPTIONS_ASKS_FLAT_BOOKMARKS');

      let success

      try {
        await flatBookmarks()
        success = true
      } catch (e) {
        console.log('Error on flatting bookmarks', e)
      }
      
      browser.runtime.sendMessage({
        command: EXTENSION_COMMAND_ID.FLAT_BOOKMARKS_RESULT,
        success,
      });

      break
    }
  }
}
const runtimeController = {
  async onStartup() {
    logEvent('runtime.onStartup');
    // is only firefox use it?
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onStartup'
    });
  },
  async onInstalled () {
    logEvent('runtime.onInstalled');
    createContextMenu()
    updateActiveTab({
      useCache: true,
      debugCaller: 'runtime.onInstalled'
    });
  },
  async onMessage (message, sender) {
    logEvent('runtime.onMessage message', message);

    await onIncomingMessage(message, sender)
  }
};
const storageController = {
  
  async onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const settingSet = new Set([
        STORAGE_KEY.CLEAR_URL,
        STORAGE_KEY.SHOW_PATH_LAYERS,
        STORAGE_KEY.SHOW_PREVIOUS_VISIT,
        STORAGE_KEY.SHOW_BOOKMARK_TITLE,
        STORAGE_KEY.ADD_BOOKMARK_IS_ON,
        //STORAGE_KEY.ADD_BOOKMARK_LIST_SHOW,
        STORAGE_KEY.ADD_BOOKMARK_LIST_LIMIT,
        STORAGE_KEY.ADD_BOOKMARK_TAG_LENGTH
      ].map((key) => STORAGE_KEY_META[key].storageKey))
      const intersectSet = changesSet.intersection(settingSet)

      if (intersectSet.size > 0) {
        logEvent('storage.onChanged', namespace, changes);

        memo.invalidateSettings()

        if (changesSet.has(STORAGE_KEY.SHOW_PREVIOUS_VISIT)) {
          memo.cacheUrlToVisitList.clear()
        }
      }
    }
  },
};
const tabsController = {
  onCreated({ pendingUrl: url, index, id }) {
    logEvent('tabs.onCreated', index, id, url);
    // We do not have current visit in history on tabs.onCreated(). Only after tabs.onUpdated(status = loading)
    getBookmarkInfoUni({
      url,
      useCache: true,
    });
  },
  async onUpdated(tabId, changeInfo, Tab) {
    logEvent('tabs.onUpdated 00', Tab.index, tabId, changeInfo);

    if (changeInfo?.url) {
      if (memo.activeTabId && tabId === memo.activeTabId) {
        memo.activeTabUrl = changeInfo.url
      }
    }

    switch (changeInfo?.status) {
      case ('loading'): {
        if (changeInfo?.url) {
          const url = changeInfo.url
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, url);
          let cleanUrl

          if (memo.settings[STORAGE_KEY.CLEAR_UR]) {
            ({ cleanUrl } = removeQueryParamsIfTarget(url));
            
            if (url !== cleanUrl) {
              await clearUrlInTab({ tabId, cleanUrl })
            }
          }

          const actualUrl = cleanUrl || url
          getBookmarkInfoUni({
            url: actualUrl,
            useCache: true,
          });
          getHistoryInfo({ url: actualUrl, useCache: false })
        }

        break;
      }
      case ('complete'): {
        logEvent('tabs.onUpdated 11 complete tabId activeTabId', tabId, memo.activeTabId);
        
        if (tabId === memo.activeTabId || !memo.activeTabId) {
          logEvent('tabs.onUpdated 22 COMPLETE', Tab.index, tabId, Tab.url);
          updateTab({
            tabId, 
            url: Tab.url, 
            useCache: true,
            debugCaller: 'tabs.onUpdated(complete)'
          });

          if (IS_BROWSER_FIREFOX && !memo.activeTabId) {
            const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
            const [Tab] = tabs;

            if (Tab?.id) {
              browser.tabs.update(Tab.id, { active: true })
            }
          }
        }
    
        break;
      }
    }
  },
  async onActivated({ tabId }) {
    logEvent('tabs.onActivated 00', tabId);
    memo.activeDialogTabOnActivated(tabId)

    if (memo.activeTabId !== tabId) {
      memo.previousTabId = memo.activeTabId;
      memo.activeTabId = tabId;
    }

    try {
      const Tab = await browser.tabs.get(tabId);

      if (Tab) {
        logDebug('tabs.onActivated 11', Tab.index, tabId, Tab.url);
        memo.activeTabUrl = Tab.url
        memo.isActiveTabBookmarkManager = (Tab.url && Tab.url.startsWith('chrome://bookmarks'));
      }

      updateTab({
        tabId, 
        url: Tab.url, 
        useCache: true,
        debugCaller: 'tabs.onActivated(useCache: true)'
      });
      updateTab({
        tabId, 
        url: Tab.url, 
        useCache: false,
        debugCaller: 'tabs.onActivated(useCache: false)'
      });
    } catch (er) {
      logIgnore('tabs.onActivated. IGNORING. tab was deleted', er);
    }

    deleteUncleanUrlBookmarkForTab(memo.previousTabId)
  },
  async onRemoved(tabId) {
    deleteUncleanUrlBookmarkForTab(tabId)
  }
}
const windowsController = {
  async onFocusChanged(windowId) {
    logDebug('windows.onFocusChanged', windowId);
    
    if (0 < windowId) {
      logEvent('windows.onFocusChanged', windowId);
      updateActiveTab({
        useCache: true,
        debugCaller: 'windows.onFocusChanged'
      });
    }
  },
};
// console.log('IMPORTING', 'bkm-info-sw.js')
browser.storage.onChanged.addListener(storageController.onChanged);

browser.bookmarks.onCreated.addListener(bookmarksController.onCreated);
browser.bookmarks.onMoved.addListener(bookmarksController.onMoved);
browser.bookmarks.onChanged.addListener(bookmarksController.onChanged);
browser.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

// listen for window switching
browser.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

browser.tabs.onCreated.addListener(tabsController.onCreated);
browser.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
browser.tabs.onActivated.addListener(tabsController.onActivated);
browser.tabs.onRemoved.addListener(tabsController.onRemoved);

browser.menus.onClicked.addListener(contextMenusController.onClicked); 

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
browser.runtime.onMessage.addListener(runtimeController.onMessage);

// console.log('IMPORT END', 'bkm-info-sw.js')