import {
  tagList,
} from './structure/index.js'

export async function initExtension() {
  await tagList.readFromStorage()
}