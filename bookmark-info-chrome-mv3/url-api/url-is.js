const supportedProtocols = ["https:", "http:"];

export function isSupportedProtocol(urlString) {
  try {
    const url = new URL(urlString);

    return supportedProtocols.includes(url.protocol);
  // eslint-disable-next-line no-unused-vars
  } catch (_er) {
    return false;
  }
}

const isYoutube = (hostname) => hostname.endsWith('youtube.com')

function isYouTubeChannelPathWithoutSubdir(pathname) {
  const [part1, part2, part3] = pathname.split('/').filter(Boolean)
  let result = false

  if (!part1) {
    return false
  }

  switch (true) {
    case part1.startsWith('@'):
      result = !part2
      break
    case part1 == 'c':
    case part1 == 'channel':
    case part1 == 'user':
      result = !part3
      break
    // case part1 == 'watch':
    // case !part1:
    //   result = false
  }

  return result
}

export const isYouTubeChannelWithoutSubdir = (url) => {
  const oUrl = new URL(url)

  return isYoutube(oUrl.hostname) && isYouTubeChannelPathWithoutSubdir(oUrl.pathname)
}
