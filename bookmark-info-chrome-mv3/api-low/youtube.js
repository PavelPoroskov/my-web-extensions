// return pathname.startsWith('/@')
//   || pathname.startsWith('/c/')
//   || pathname.startsWith('/channel/')
//   || pathname.startsWith('/user/')
// function isYouTubeChannel(pathname) {
//   let result = true

//   switch (pathname) {
//     case '/':
//     case '/watch':
//       result = false
//   }

//   return result
// }

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

export const isYouTubeChannelWithoutSubdir = (oUrl) => isYoutube(oUrl.hostname) && isYouTubeChannelPathWithoutSubdir(oUrl.pathname)
