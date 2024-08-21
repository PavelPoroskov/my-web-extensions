import {
  browserStartTime,
  extensionSettings,
  tagList,
} from './structure/index.js'

export async function initExtension() {
  // await tagList.readFromStorage()

  await Promise.all([
    !browserStartTime.isActual() && browserStartTime.init(),
    !extensionSettings.isActual() && extensionSettings.restoreFromStorage().then(() => tagList.readFromStorage()),
  ])
}