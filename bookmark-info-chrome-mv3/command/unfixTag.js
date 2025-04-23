import {
  tagList,
} from '../api-mid/index.js'

export async function unfixTag(parentId) {
  await tagList.removeFixedTag(parentId)
}
