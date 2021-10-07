import { Zip, ZipDeflate, ZipPassThrough } from "fflate"
import JSZip from "jszip"
import { generateRandomImage } from "./NFTRandomGenerator"

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}

const generateAssetsZipFile = async (
  amount,
  traits,
  file) => {
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
  const zip = new Zip()
  zip.ondata = (err, data, final) => {    
    // eslint-disable-next-line
    self.postMessage({type: "data", data, last: final})

    if (final) {
      // eslint-disable-next-line
      self.postMessage({type: "done"})
    }
  }
console.log(amount)
  for (let i = 0; i < amount; i++) {
    const [image, metadata] = await generateRandomImage(traits, fileMap)
    const imageBuffer = await image.arrayBuffer()
    const imageChunk = new Uint8Array(imageBuffer)
    const imageFile = new ZipPassThrough(`${i + 1}.png`)
    zip.add(imageFile)
    imageFile.push(imageChunk, true)

    const metadataFile = new ZipDeflate(`${i + 1}.json`, { level: 9 })   
    zip.add(metadataFile)
    metadataFile.push(str2ab(JSON.stringify(metadata)), true)

    // eslint-disable-next-line
    self.postMessage({type: "progress", progress: `${i + 1}`})
  }
  zip.end()
  zip.terminate()
}

onmessage = async (e) => {
  const { amount, traits, zipFile } = e.data
  generateAssetsZipFile(amount, traits, zipFile)
}
