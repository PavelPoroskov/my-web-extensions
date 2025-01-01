import {
  tagList,
} from '../data-structures/index.js'

export async function fixTag({ parentId, title }) {
  await tagList.addFixedTag({
    parentId,
    title,
  })
}
