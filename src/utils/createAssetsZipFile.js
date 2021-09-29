import JSZip from "jszip"
import { generateRandomImage } from "./NFTRandomGenerator"
const { Canvas, Image } = require('canvas')

console.log(Canvas)

const generateAssetsZipFile = async (
  amount,
  traits,
  file
) => {
  const initialTime = (new Date()).getTime()
  const originalZip = await JSZip.loadAsync(file)
  let fileMap = {}
  originalZip
    .filter((relativePath, zipEntry) => {
      return !relativePath.startsWith("__MACOSX")
    })
    .forEach((file) => {
      if (!file.dir) {
        const [traitName, valueName] = file.name.split("/")
        const newValueName = valueName.substring(0, valueName.lastIndexOf("."))
        fileMap = {
          ...fileMap,
          [traitName]: {
            ...fileMap[traitName],
            [newValueName]: file,
          },
        }
      }
    })
  const zip = new JSZip()

  const content = await Promise.all(
    Array(amount)
      .fill(null)
      .map(() => generateRandomImage(traits, fileMap))
  )

  const endTime = (new Date()).getTime()

  console.log("All images generated in ", endTime - initialTime, "ms")

  content.forEach(([image, metadata], index) => {
    zip.file(
      `${index + 1}.png`,
      image
    )
    zip.file(`${index + 1}.json`, JSON.stringify(metadata))
  })

  console.log("images generated, starting zip file creation")

  const zipContent = await zip.generateAsync({ type: "blob" })
  const zipFile = new File([zipContent], "assets.zip")

  console.log("all done. handling file back to main thread")

  // eslint-disable-next-line
  self.postMessage(zipFile)
}

onmessage = (e) => {
  console.log("hrer")
  const { amount, traits, zipFile } = e.data
  console.log("onmessage")
  generateAssetsZipFile(amount, traits, zipFile)
}
