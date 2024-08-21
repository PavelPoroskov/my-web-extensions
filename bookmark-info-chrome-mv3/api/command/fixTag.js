import {
  tagList,
} from '../structure/index.js'

export async function fixTag({ parentId, title }) {
  await tagList.addFixedTag({
    parentId,
    title,
  })
}
