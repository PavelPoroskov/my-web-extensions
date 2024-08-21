import {
  tagList,
} from '../structure/index.js'

export async function unfixTag(parentId) {
  await tagList.removeFixedTag(parentId)
}