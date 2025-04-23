import {
  tagList,
} from '../api-mid/index.js'

export async function fixTag({ parentId, title }) {
  await tagList.addFixedTag({
    parentId,
    title,
  })
}
