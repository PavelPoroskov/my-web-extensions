
// const exceptionList = [
//   'youtube.com',
//   'www.youtube.com',
//   'youtu.be',
//   'career.proxify.io',
//   'proxify.io',
// ]
// const exceptionSet = new Set(exceptionList)

const targetList = [
  'www.linkedin.com',
  'linkedin.com',
]
const targetSet = new Set(targetList)

export const cleanLink = (link) => {
  try {
    const oLink = new URL(link);
    const { hostname } = oLink;

    if (targetSet.has(hostname)) {
      oLink.search = ''
    }
  
    return oLink.toString();  
  } catch (e) {
    return link
  }
}

// let testStr = "https://www.linkedin.com/jobs/view/3920634940/?alternateChannel=search&refId=dvaqme%2FfxHehSAa5o4nVnA%3D%3D&trackingId=8%2FZKaGcTAInuTTH4NyKDoA%3D%3D"
// console.log('test cleanLink', cleanLink(testStr))

// testStr = "https://www.youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test cleanLink', cleanLink(testStr))

// testStr = "https://youtube.com/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test cleanLink', cleanLink(testStr))

// testStr = "https://youtu.be/watch?v=YuJ6SasIS_E&t=356s"
// console.log('test cleanLink', cleanLink(testStr))
//
// https://career.proxify.io/apply?uuid=566c933b-432e-64e0-b317-dd4390d6a74e&step=AdditionalInformation