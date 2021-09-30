import JSZip from "jszip"
import { generateRandomImage } from "./NFTRandomGenerator"

const generateAssetsZipFile = async (
  amount,
  traits,
  file,
  fileWriter
) => {
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

  for (let i = 0; i < amount; i++) {
    const [image, metadata] = await generateRandomImage(traits, fileMap)
    zip.file(
      `${i + 1}.png`,
      image
    )
    zip.file(`${i + 1}.json`, JSON.stringify(metadata))
    // eslint-disable-next-line
    self.postMessage({type: "progress", progress: `${i + 1}/${amount}`})
  }

  zip
    .generateInternalStream({type: "blob"})
    .on("data", async (data, metadata) => {
      // eslint-disable-next-line
      self.postMessage({type: "data", data, metadata})
    })
    .on("end", async () => {
      // eslint-disable-next-line
      self.postMessage({type: "done"})
    })
    .resume()
}

onmessage = async (e) => {
  const { amount, traits, zipFile } = e.data
  generateAssetsZipFile(amount, traits, zipFile)
}
