import {
  tagList,
} from '../api/structure/index.js'

export async function unfixTag(parentId) {
  await tagList.removeFixedTag(parentId)
}
