const BROWSER_OPTIONS = {
  CHROME: 'CHROME',
  FIREFOX: 'FIREFOX',
}
const BROWSER_SPECIFIC_OPTIONS = {
  [BROWSER_OPTIONS.CHROME]: {
    MENU_CONTEXT: ['all'],
  },
  [BROWSER_OPTIONS.FIREFOX]: {
    MENU_CONTEXT: ['all','tab'],
  },
}
const BROWSER = BROWSER_OPTIONS.FIREFOX;
const IS_BROWSER_FIREFOX = BROWSER === BROWSER_OPTIONS.FIREFOX;
const BROWSER_SPECIFIC = BROWSER_SPECIFIC_OPTIONS[BROWSER];

const SOURCE = {
  CACHE: 'CACHE',
  ACTUAL: 'ACTUAL',
};

const BASE_ID = 'BKM_INF';

const MENU = {
  CLOSE_DUPLICATE: `${BASE_ID}_CLOSE_DUPLICATE`,
  CLOSE_BOOKMARKED: `${BASE_ID}_CLOSE_BOOKMARKED`,
  CLEAR_URL: `${BASE_ID}_CLEAR_URL`,
  // BOOKMARK_AND_CLOSE: `${BASE_ID}_BOOKMARK_AND_CLOSE`,
};

const USER_SETTINGS_OPTIONS = {
  CLEAR_URL_FROM_QUERY_PARAMS: 'CLEAR_URL_FROM_QUERY_PARAMS',
  SHOW_PATH_LAYERS: 'SHOW_PATH_LAYERS',
  SHOW_PREVIOUS_VISIT: 'SHOW_PREVIOUS_VISIT',
  SHOW_BOOKMARK_TITLE: 'SHOW_BOOKMARK_TITLE',
  SHOW_PROFILE: 'SHOW_PROFILE',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  // MARK_VISITED_URL: 'MARK_VISITED_URL',
}

const SHOW_PREVIOUS_VISIT_OPTION = {
  NEVER: 0,
  ONLY_NO_BKM: 1,
  ALWAYS: 2,
}
const o = USER_SETTINGS_OPTIONS
const USER_SETTINGS_DEFAULT_VALUE = {
  [o.CLEAR_URL_FROM_QUERY_PARAMS]: true,
  [o.SHOW_PATH_LAYERS]: 1, // [1, 2, 3]
  [o.SHOW_PREVIOUS_VISIT]: SHOW_PREVIOUS_VISIT_OPTION.ALWAYS,
  [o.SHOW_BOOKMARK_TITLE]: false,
  [o.SHOW_PROFILE]: false,
  [o.ADD_BOOKMARK]: false,
}

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

const RECENT_TAG_INTERNAL_LIMIT = 30;
const RECENT_TAG_VISIBLE_LIMIT = 20;
const CONFIG = {
  SHOW_LOG_CACHE: false,
  SHOW_LOG_SEND_EVENT: false,
  SHOW_LOG_EVENT: false,
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

const log = CONFIG.SHOW_LOG ? makeLogWithPrefix() : () => { };
const logCache = CONFIG.SHOW_LOG_CACHE ? logWithTime : () => { };
const logSendEvent = CONFIG.SHOW_LOG_SEND_EVENT ? makeLogWithPrefix('SEND =>') : () => { };
const logEvent = CONFIG.SHOW_LOG_EVENT ? makeLogWithPrefix('EVENT <=') : () => { };
const logIgnore = CONFIG.SHOW_LOG_IGNORE ? makeLogWithPrefix('IGNORE') : () => { };
const logOptimization = CONFIG.SHOW_LOG_OPTIMIZATION ? makeLogWithPrefix('OPTIMIZATION') : () => { };
const logPromiseQueue = CONFIG.SHOW_LOG_QUEUE ? logWithTime : () => { };
const logDebug = CONFIG.SHOW_DEBUG ? makeLogWithPrefix('DEBUG') : () => { };
const logSettings = CONFIG.SHOW_SETTINGS ? makeLogWithPrefix('SETTINGS') : () => { };
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
async function getRecentTagList(nItems) {
  logDebug('getRecentTagList() 00', nItems)
  const list = await browser.bookmarks.getRecent(nItems*3);

  const folderList = list
    .filter(({ url }) => !url)

  const folderByIdMap = Object.fromEntries(
    folderList.map(({ id, title, dateAdded}) => [
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
    .sort((a,b) => -(a.dateAdded - b.dateAdded))
    .slice(0, nItems)
}

async function filterFixedTagList(list = []) {
  const idList = list.map(({ parentId }) => parentId)

  if (idList.length === 0) {
    return []
  }

  const folderList = await browser.bookmarks.get(idList)

  return folderList
    .filter(Boolean)
    .map(({ id, title }) => ({ parentId: id, title }))
}
// console.log('IMPORTING', 'memo.js')
const STORAGE_LOCAL__FIXED_TAG_LIST = 'FIXED_TAG_LIST'
const STORAGE_SESSION__RECENT_TAG_LIST = 'RECENT_TAG_LIST'

const memo = {
  activeTabId: '',
  previousTabId: '',
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

      const savedSettings = await browser.storage.local.get(
        Object.values(USER_SETTINGS_OPTIONS)
      );
    
      this._settings = {
        ...USER_SETTINGS_DEFAULT_VALUE,
        ...savedSettings,
      };
      logSettings('readSavedSettings')
      logSettings(`actual settings: ${Object.entries(this._settings).map(([k,v]) => `${k}: ${v}`).join(', ')}`)  

      await this.readTagList()

      this._isSettingsActual = true
    }
  },
  get settings() {
    return { ...this._settings }
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

      const STORAGE_SESSION__START_TIME = 'START_TIME'
      const storedSession = await browser.storage.session.get(STORAGE_SESSION__START_TIME)
      logSettings('storedSession', storedSession)

      if (storedSession[STORAGE_SESSION__START_TIME]) {
        this._profileStartTimeMS = storedSession[STORAGE_SESSION__START_TIME]
      } else {
        // I get start for service-worker now.
        //    It is correct if this web-extension was installed in the previous browser session
        // It is better get for window // min(window.startTime(performance.timeOrigin)) OR min(tab(performance.timeOrigin))
        //  tab with minimal tabId
        this._profileStartTimeMS = performance.timeOrigin
        await browser.storage.session.set({
          [STORAGE_SESSION__START_TIME]: this._profileStartTimeMS
        })

      }

      logSettings('profileStartTimeMS', new Date(this._profileStartTimeMS).toISOString())
      this._isProfileStartTimeMSActual = true
    }
  },

  _fixedTagList: [],
  _recentTagList: [],
  get fixedTagList() {
    return this._fixedTagList
  },
  get recentTagList() {
    return this._recentTagList
  },
  async readTagList() {
    logSettings('readTagList 11')

    if (this._settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      logSettings('readTagList 22')
      const [savedLocal, savedSession] = await Promise.all([
        browser.storage.local.get(STORAGE_LOCAL__FIXED_TAG_LIST),
        browser.storage.session.get(STORAGE_SESSION__RECENT_TAG_LIST),
      ]);
    

      if (!savedSession[STORAGE_SESSION__RECENT_TAG_LIST]) {
        logSettings('readTagList 22 11')
        this._fixedTagList = await filterFixedTagList(savedLocal[STORAGE_LOCAL__FIXED_TAG_LIST])
        this._recentTagList = await getRecentTagList(RECENT_TAG_INTERNAL_LIMIT)
      } else {
        logSettings('readTagList 22 77')
        this._fixedTagList = savedLocal[STORAGE_LOCAL__FIXED_TAG_LIST] || []
        this._recentTagList = savedSession[STORAGE_SESSION__RECENT_TAG_LIST]
      }  
    } else {
      logSettings('readTagList 44')

      this._fixedTagList = []
      this._recentTagList = []
    }
  },
  async addRecentTag({ parentId, dateAdded }) {
    logSettings('addRecentTag 00', parentId, dateAdded )
    const actualDateAdded = dateAdded || Date.now()
    logSettings('addRecentTag 11 actualDateAdded', actualDateAdded )

    const folderByIdMap = Object.fromEntries(
      this._recentTagList.map(({ parentId, title, dateAdded }) => [
        parentId,
        {
          title,
          dateAdded,
          isSourceFolder: true,
        }
      ])
    )

    const [newFolder] = await browser.bookmarks.get(parentId)
    logSettings('addRecentTag 22 newFolder', newFolder )
    logSettings('addRecentTag 22 newFolder.title', newFolder.title )
    folderByIdMap[parentId] = {
      ...folderByIdMap[parentId],
      dateAdded: actualDateAdded,
      title: newFolder.title
    }

    this._recentTagList = Object.entries(folderByIdMap)
      .map(([parentId, { title, dateAdded }]) => ({ parentId, title, dateAdded }))
      .sort((a,b) => -(a.dateAdded - b.dateAdded))
      .slice(0, RECENT_TAG_INTERNAL_LIMIT)

    await browser.storage.session.set({
      [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
    })
  },
  async removeTag(id) {
    const isInFixedList = this._fixedTagList.some(({ parentId }) => parentId === id)

    if (isInFixedList) {
      this._fixedTagList = this._fixedTagList.filter(({ parentId }) => parentId !== id)
    }

    const isInRecentList = this._recentTagList.some(({ parentId }) => parentId === id)

    if (isInRecentList) {
      this._recentTagList = this._recentTagList.filter(({ parentId }) => parentId !== id)
    }

    if (isInFixedList || isInRecentList) {
      await Promise.all([
        isInFixedList && browser.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
        }),
        isInRecentList && browser.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
        })
      ])
    }
  },
  async updateTag(id, title) {
    const isInFixedList = this._fixedTagList.some(({ parentId }) => parentId === id)

    if (isInFixedList) {
      this._fixedTagList = this._fixedTagList.map(
        (item) => (item.parentId === id
          ? {
            ...item,
            title,
          }
          : item
        )
      )
    }

    const isInRecentList = this._recentTagList.some(({ parentId }) => parentId === id)

    if (isInRecentList) {
      this._recentTagList = this._recentTagList.map(
        (item) => (item.parentId === id
          ? {
            ...item,
            title,
          }
          : item
        )
      )
    }

    if (isInFixedList || isInRecentList) {
      await Promise.all([
        isInFixedList && browser.storage.local.set({
          [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
        }),
        isInRecentList && browser.storage.session.set({
          [STORAGE_SESSION__RECENT_TAG_LIST]: this._recentTagList
        })
      ])
    }
  },
  async addFixedTag({ parentId, title }) {
    const item = this._fixedTagList.find((item) => item.parentId === parentId)

    if (!item) {
      this._fixedTagList.push({ parentId, title })
      await browser.storage.local.set({
        [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
      })
    }
  },
  async removeFixedTag(id) {
    this._fixedTagList = this._fixedTagList.filter(({ parentId }) => parentId !== id)
    await browser.storage.local.set({
      [STORAGE_LOCAL__FIXED_TAG_LIST]: this._fixedTagList
    })
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

  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
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
  const showPreviousVisit = memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT]
  
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
let cleanUrl

async function cleanUrlIfTarget({ url, tabId }) {
  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    ({ cleanUrl } = removeQueryParamsIfTarget(url));
    
    if (url !== cleanUrl) {
      const msg = {
        command: "changeLocationToCleanUrl",
        cleanUrl,
      }
      logSendEvent('runtimeController.onMessage(contentScriptReady)', tabId, msg)
      await browser.tabs.sendMessage(tabId, msg)
        .catch((err) => {
          logIgnore('runtimeController.onMessage(contentScriptReady) sendMessage(changeLocationToCleanUrl)', err)
        })

      return cleanUrl
    }
  }
}

async function updateBookmarksForTabTask({ tabId, url, useCache=false }) {
  logDebug('updateBookmarksForTabTask 00 (', tabId, useCache, url);
  // logDebug('updateBookmarksForTabTask(', tabId, useCache, url)

  let actualUrl = url

  if (memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
    const { cleanUrl } = removeQueryParamsIfTarget(url)

    if (url !== cleanUrl) {
      actualUrl = cleanUrl
    }
  } 

  logDebug('updateBookmarksForTabTask 11 ');
  const bookmarkInfo = await getBookmarkInfoUni({ url: actualUrl, useCache });
  // const usedParentIdSet = new Set(bookmarkInfo.map(({ parentId }) => parentId))
  const fixedParentIdSet = new Set(memo.fixedTagList.map(({ parentId }) => parentId))
  // const usedOrFixedParentIdSet = usedParentIdSet.union(fixedParentIdSet)

  logDebug('updateBookmarksForTabTask 22 ');
  logDebug('memo.fixedTagList Array.isArray', Array.isArray(memo.fixedTagList));
  logDebug('memo.fixedTagList length', memo.fixedTagList.length);
  logDebug('memo.recentTagList Array.isArray', Array.isArray(memo.recentTagList));
  logDebug('memo.recentTagList length', memo.recentTagList.length);

  let message = {}
  try {
    // const message = {
    message = {
        command: "bookmarkInfo",
      bookmarkInfoList: bookmarkInfo.bookmarkInfoList,
      showLayer: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PATH_LAYERS],
      isShowTitle: memo.settings[USER_SETTINGS_OPTIONS.SHOW_BOOKMARK_TITLE],
      fixedTagList: memo.fixedTagList
        // .filter(({ parentId }) => !usedParentIdSet.has(parentId))
        .filter(({ title }) => title)
        .sort(({ title: a }, { title: b}) => a.localeCompare(b)),
      recentTagList: memo.recentTagList
        // .filter(({ parentId }) => !usedOrFixedParentIdSet.has(parentId))
        .filter(({ parentId }) => !fixedParentIdSet.has(parentId))
        .filter(({ title }) => title)
        .sort(({ title: a }, { title: b }) => a.localeCompare(b))
        .slice(0, RECENT_TAG_VISIBLE_LIMIT),
    }
  
  }catch (e) {
    logDebug('updateBookmarksForTabTask got errr', e);
    logDebug('memo.recentTagList', memo.recentTagList);
  }

  logDebug('updateBookmarksForTabTask 33 ');
  logSendEvent('updateBookmarksForTabTask()', tabId, message);
  // logDebug('updateBookmarksForTabTask() sendMessage', tabId, message)

  await browser.tabs.sendMessage(tabId, message)
  logDebug('updateBookmarksForTabTask 44 ');
  
  return bookmarkInfo
}
async function updateVisitsForTabTask({ tabId, url, useCache=false }) {
  log('updateVisitsForTabTask(', tabId, useCache, url);

  const visitInfo = await getHistoryInfo({ url, useCache })

  const message = {
    command: "visitInfo",
    showPreviousVisit: memo.settings[USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT],
    visitList: visitInfo.visitList,
  }
  logSendEvent('updateVisitsForTabTask()', tabId, message);
  
  return browser.tabs.sendMessage(tabId, message)
    .then(() => visitInfo);
}

async function updateTab({ tabId, url, useCache=false, debugCaller }) {
  if (url && isSupportedProtocol(url)) {

    logDebug('updateTab memo.isSettingsActual', memo.isSettingsActual);
    await Promise.all([
      !memo.isProfileStartTimeMSActual && memo.readProfileStartTimeMS(),
      !memo.isSettingsActual && memo.readSettings(),
    ])
    logDebug('updateTab memo.readSettings() AFTER');

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
  // logDebug(' updateActiveTab() 00')
  const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const [Tab] = tabs;

  if (Tab) {
    updateTab({
      tabId: Tab.id, 
      url: Tab.url, 
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
async function replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId }) {
  const bookmarkList = await browser.bookmarks.search({ url: cleanUrl });
  const isExist = bookmarkList.some(({ parentId }) => parentId === node.parentId)

  if (!isExist) {
    await browser.bookmarks.create({
      parentId: node.parentId,
      title: node.title,
      url: cleanUrl
    })
  }

  const msg = {
    command: "changeLocationToCleanUrl",
    cleanUrl,
  }
  logSendEvent('bookmarksController.onCreated()', activeTab.id, msg)
  await browser.tabs.sendMessage(activeTab.id, msg)

  memo.tabMap.set(activeTab.id, {
    bookmarkId,
    originalUrl: node.url
  })
}

const bookmarksController = {
  async onCreated(bookmarkId, node) {
    logEvent('bookmark.onCreated <-');

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      await memo.addRecentTag(node)
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onCreated'
    });

    if (node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);

      if (node.url !== cleanUrl) {
        const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;
  
        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        }
      }      
    }
  
    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onChanged(bookmarkId, changeInfo) {
    logEvent('bookmark.onChanged 00 <-', changeInfo);

    memo.bkmFolderById.delete(bookmarkId);


    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK] && !changeInfo.title) {
      await memo.updateTag(bookmarkId, changeInfo.title)
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onChanged'
    });

    const [node] = await browser.bookmarks.get(bookmarkId)

    if (changeInfo.title && node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        } else if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await browser.bookmarks.search({ url: cleanUrl });

          await Promise.all(bookmarkList.map(
            bItem => browser.bookmarks.update(bItem.id, { title: changeInfo.title })
          ))
        }

      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });        
  },
  async onMoved(bookmarkId, { oldParentId, parentId }) {
    logEvent('bookmark.onMoved <-');
    memo.bkmFolderById.delete(bookmarkId);

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK]) {
      await memo.addRecentTag({ parentId })
    }
    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onMoved'
    });

    const [node] = await browser.bookmarks.get(bookmarkId)

    if ((oldParentId || parentId) && node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        
        if (node.url === activeTab?.url) {
          replaceUrlToCleanUrl({ node, cleanUrl, activeTab, bookmarkId })
        } else if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await browser.bookmarks.search({ url: cleanUrl });
          const cleanBkmWithOldParentId = bookmarkList.filter(({ parentId }) => parentId === oldParentId)

          await Promise.all(cleanBkmWithOldParentId.map(
            bItem => browser.bookmarks.move(bItem.id, { parentId })
          ))
        }
      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node.url });
  },
  async onRemoved(bookmarkId, { node }) {
    logEvent('bookmark.onRemoved <-');
    memo.bkmFolderById.delete(bookmarkId);

    if (memo.settings[USER_SETTINGS_OPTIONS.ADD_BOOKMARK] && !node.url) {
      await memo.removeTag(bookmarkId)
    }

    // changes in active tab
    await updateActiveTab({
      debugCaller: 'bookmark.onRemoved'
    });

    if (node.url && memo.settings[USER_SETTINGS_OPTIONS.CLEAR_URL_FROM_QUERY_PARAMS]) {
      const { cleanUrl } = removeQueryParamsIfTarget(node.url);
      
      if (node.url !== cleanUrl) {
        const [activeTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

        if (activeTab && activeTab.id && node.url === memo.tabMap.get(activeTab.id)?.originalUrl) {
          const bookmarkList = await browser.bookmarks.search({ url: cleanUrl });

          await Promise.all(bookmarkList.map(
            bItem => browser.bookmarks.remove(bItem.id)
          ))  

          memo.tabMap.delete(activeTab.id)
        }
      }
    }

    // changes in bookmark manager
    getBookmarkInfoUni({ url: node?.url });
  },
}
const contextMenusController = {
  async onClicked (OnClickData) {
    logEvent('contextMenus.onClicked <-');

    switch (OnClickData.menuItemId) {
      case MENU.CLOSE_DUPLICATE: {
        closeDuplicateTabs();
        break;
      }
      case MENU.CLOSE_BOOKMARKED: {
        closeBookmarkedTabs();
        break;
      }
      case MENU.CLEAR_URL: {
        const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
        const [activeTab] = tabs;

        if (activeTab?.id && activeTab?.url) {
          const cleanUrl = removeQueryParams(activeTab.url);

          if (activeTab.url !== cleanUrl) {
            const msg = {
              command: "changeLocationToCleanUrl",
              cleanUrl,
            }
            logSendEvent('contextMenusController.onClicked(CLEAR_URL)', activeTab.id, msg)
            await browser.tabs.sendMessage(activeTab.id, msg)
          }
        }

        break;
      }
    }
  }
}
async function createContextMenu() {
  await browser.menus.removeAll();

  browser.menus.create({
    id: MENU.CLOSE_DUPLICATE,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close duplicate tabs',
  });  
  // TODO? bookmark and close all tabs (tabs without bookmarks and tabs with bookmarks)
  //   copy bookmarked tabs
  browser.menus.create({
    id: MENU.CLOSE_BOOKMARKED,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'close bookmarked tabs',
  });
  // TODO? bookmark and close tabs (tabs without bookmarks)
  browser.menus.create({
    id: MENU.CLEAR_URL,
    contexts: BROWSER_SPECIFIC.MENU_CONTEXT,
    title: 'clear url',
  });
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

    switch (message?.command) {
      case "deleteBookmark": {
        logEvent('runtime.onMessage deleteBookmark');
  
        deleteBookmark(message.bkmId);
        break
      }
      case "addBookmark": {
        logEvent('runtime.onMessage addBookmark');
  
        await browser.bookmarks.create({
          index: 0,
          parentId: message.parentId,
          title: message.title,
          url: message.url
        })

        break
      }
      case "fixTag": {
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
      case "unfixTag": {
        logEvent('runtime.onMessage unfixTag');
  
        await memo.removeFixedTag(message.parentId)
        updateActiveTab({
          debugCaller: 'runtime.onMessage unfixTag',
          useCache: true,
        });

        break
      }
      case "contentScriptReady": {
        const senderTabId = sender?.tab?.id;
        logEvent('runtime.onMessage contentScriptReady', senderTabId);

        if (senderTabId) {
          const cleanUrl = await cleanUrlIfTarget({ url: message.url, tabId: senderTabId })
          updateTab({
            tabId: senderTabId,
            url: cleanUrl || message.url,
            useCache: true,
            debugCaller: 'runtime.onMessage contentScriptReady',
          })
        }

        break
      }
    }
  }
};
const storageController = {
  
  async onChanged(changes, namespace) {
    
    if (namespace === 'local') {
      const changesSet = new Set(Object.keys(changes))
      const settingSet = new Set(Object.values(USER_SETTINGS_OPTIONS))
      const intersectSet = changesSet.intersection(settingSet)

      if (intersectSet.size > 0) {
        logEvent('storage.onChanged', namespace, changes);

        memo.invalidateSettings()

        if (changesSet.has(USER_SETTINGS_OPTIONS.SHOW_PREVIOUS_VISIT)) {
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
    switch (changeInfo?.status) {
      case ('loading'): {
        if (changeInfo?.url) {
          logEvent('tabs.onUpdated 11 LOADING', Tab.index, tabId, changeInfo.url);
          const cleanUrl = await cleanUrlIfTarget({ url: changeInfo.url, tabId })
          const actualUrl = cleanUrl || changeInfo.url
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
    
    if (memo.activeTabId !== tabId) {
      memo.previousTabId = memo.activeTabId;
      memo.activeTabId = tabId;
    }
    logEvent('tabs.onActivated 00', tabId);

    try {
      const Tab = await browser.tabs.get(tabId);
      logEvent('tabs.onActivated 11', Tab.index, tabId, Tab.url);
      
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
browser.bookmarks.onCreated.addListener(bookmarksController.onCreated);
browser.bookmarks.onMoved.addListener(bookmarksController.onMoved);
browser.bookmarks.onChanged.addListener(bookmarksController.onChanged);
browser.bookmarks.onRemoved.addListener(bookmarksController.onRemoved);

browser.tabs.onCreated.addListener(tabsController.onCreated);
browser.tabs.onUpdated.addListener(tabsController.onUpdated);
// listen for tab switching
browser.tabs.onActivated.addListener(tabsController.onActivated);
browser.tabs.onRemoved.addListener(tabsController.onRemoved);

// listen for window switching
browser.windows.onFocusChanged.addListener(windowsController.onFocusChanged);

browser.menus.onClicked.addListener(contextMenusController.onClicked); 

browser.runtime.onStartup.addListener(runtimeController.onStartup)
browser.runtime.onInstalled.addListener(runtimeController.onInstalled);
browser.runtime.onMessage.addListener(runtimeController.onMessage);

browser.storage.onChanged.addListener(storageController.onChanged);

// console.log('IMPORT END', 'bkm-info-sw.js')