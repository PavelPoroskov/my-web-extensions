import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_DIR_CHROME = path.resolve(import.meta.dirname, '../bookmark-info-chrome-mv3');

export async function turnOnLogging() {
  const filePath = 'api-low/log.api.js'
  const fullFilePath = path.join(BASE_DIR_CHROME, filePath);
  let content = await readFile(
    fullFilePath,
    'utf8'
  )

  content = content.replaceAll(
    'export const makeLogFunction = () => () => {}',
    'export const makeLogFunction = makeLogFunctionOn',
  );

  await writeFile(
    fullFilePath,
    content,
  )
}

await turnOnLogging()
