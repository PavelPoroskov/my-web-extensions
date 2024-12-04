import {
  browserStartTime,
  extensionSettings,
  tagList,
  memo,
} from './structure/index.js'
import {
  makeLogFunction,
} from './log-api.js'

const logIX = makeLogFunction({ module: 'init-extension' })

export async function setFirstActiveTab({ debugCaller='' }) {
  logIX(`setFirstActiveTab() 00 <- ${debugCaller}`, memo['activeTabId'])

  if (!memo.activeTabId) {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const [Tab] = tabs;

    if (Tab?.id) {
      memo.activeTabId = Tab.id;
      memo.activeTabUrl = Tab.url

      logIX(`setFirstActiveTab() 11 <- ${debugCaller}`, memo['activeTabId'])
    }
  }
}

export async function initExtension({ debugCaller='' }) {
  const isInitRequired = !browserStartTime.isActual() || !extensionSettings.isActual() || !memo.activeTabId
  if (isInitRequired) {
    logIX(`initExtension() 00 <- ${debugCaller}`)
  }

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && extensionSettings.restoreFromStorage().then(() => tagList.readFromStorage()),
    !memo.activeTabId && setFirstActiveTab({ debugCaller: `initExtension() <- ${debugCaller}` }),
  ])

  if (isInitRequired) {
    logIX('initExtension() end')
  }
}