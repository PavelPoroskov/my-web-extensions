import {
  getTitleDetails,
  getTitleWithDirectives,
} from '../folder-api/index.js';
import {
  updateFolderIgnoreInController,
} from '../bookmark-controller-api/index.js'
import {
  traverseTreeRecursively,
} from '../bookmark-list-ops/index.js'

export function isOldTopFolder(folderName) {
  const name = folderName.trim().toLowerCase()

  return name.startsWith('todo')
    || name.startsWith('source')
    || name.startsWith('list') || name.endsWith('list')
    // || name.endsWith('#top')
}

function fromOldTopFolderToNew(title) {
  const {
    onlyTitle,
    objDirectives,
  } = getTitleDetails(title)

  objDirectives['top'] = ''

  return getTitleWithDirectives({ onlyTitle, objDirectives })
}

export async function migration20260104() {
  // dated folder new format: #o:

  const renameList = []

  async function onFolder({ folder, level }) {
    if (level < 2) {
      return
    }

    if (isOldTopFolder(folder.title)) {
      renameList.push({
        id: folder.id,
        title: fromOldTopFolderToNew(folder.title),
      })
    }
  }

  await traverseTreeRecursively({ onFolder })

  await renameList.reduce(
    (promiseChain, { id, title }) => promiseChain.then(
      () => updateFolderIgnoreInController({ id,  title })
    ),
    Promise.resolve(),
  );
}
