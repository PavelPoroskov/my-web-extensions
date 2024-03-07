import { convertFileContent } from './convert-file.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_DIR_CHROME = path.resolve(__dirname, '../bookmark-info-chrome-mv3');
const BASE_DIR_FIREFOX = path.resolve(__dirname, '../bookmark-info-firefox-mv2');

const convertFile = async (inFilePath) => {
  const fullFilePath = path.join(BASE_DIR_CHROME, inFilePath);
  const fileDir = path.dirname(fullFilePath);
  const inContent = await readFile(
    fullFilePath,
    'utf8'
  )

  const { content, usedDependencies } = await convertFileContent(inContent);

  return {
    content,
    usedDependencies: usedDependencies
      .map((dep) => path.resolve(fileDir, dep))
      .map((dep) => dep.replace(`${BASE_DIR_CHROME}/`,'')),
    filePath: inFilePath,
  }
}

export const createFileForFirefox = async (arInFilePath, outFilePath) => {
  const arConvertResult = await Promise.all(arInFilePath.map(convertFile));

  const processedFiles = {};
  arConvertResult.forEach(({ usedDependencies, filePath }) => {
    const failedDependency = usedDependencies.find((dependency) => !(dependency in processedFiles));

    if (failedDependency) {
      throw new Error(`createFileForFirefox(): Failed to find dependency ${failedDependency} for ${filePath}`);
    }

    processedFiles[filePath] = true;
  })
  const convertedContent = arConvertResult
    .map((result) => result.content)
    .join('\n\r');

  await writeFile(
    path.join(BASE_DIR_FIREFOX, outFilePath),
    convertedContent, 
  )
}

export const moveVersionToManifest = async () => {
  const fromContent = await readFile(
    path.join(BASE_DIR_CHROME, 'manifest.json'),
    'utf8'
  );

  const matchResult = fromContent.match(/"version": "([^"]*)"/);
  const version = matchResult && matchResult[1];
  console.log('version', version);


  if (version) {
    let toContent = await readFile(
      path.join(BASE_DIR_FIREFOX, 'manifest.json'),
      'utf8'
    );
    toContent = toContent.replace(
      /"version": "([^"]*)"/g,
      `"version": "${version}"`
    )
  
    await writeFile(
      path.join(BASE_DIR_FIREFOX, 'manifest.json'),
      toContent, 
    )  
  }
}