import {
  browserStartTime,
  extensionSettings,
  tagList,
} from './structure/index.js'
import {
  makeLogFunction,
} from './log-api.js'

const logIX = makeLogFunction({ module: 'init-extension' })

export async function initExtension() {
  // await tagList.readFromStorage()
  logIX('initExtension() 00')

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && extensionSettings.restoreFromStorage().then(() => tagList.readFromStorage()),
  ])
  logIX('initExtension() end')
}