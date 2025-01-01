import {
  tagList,
} from '../data-structures/index.js'

export async function unfixTag(parentId) {
  await tagList.removeFixedTag(parentId)
}
