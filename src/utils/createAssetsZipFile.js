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
        const traitDisplayName = traitName.replace(/^\d+\s*/, "")
        const newValueName = valueName.substring(0, valueName.lastIndexOf("."))
        fileMap = {
          ...fileMap,
          [traitDisplayName]: {
            ...fileMap[traitDisplayName],
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

  const metadataKeys = []
  let duplicateFound = false
  const fullMetadataFile = new ZipDeflate("metadata.json", { level: 9 })
  zip.add(fullMetadataFile)

  fullMetadataFile.push(str2ab("["))

  for (let i = 0; i < amount; i++) {
    const [image, metadata, metadataKey, duplicate] = await generateNonDuplicateImage(traits, fileMap, metadataKeys, !duplicateFound)

    duplicateFound = duplicateFound || duplicate
    metadataKeys.push(metadataKey)

    const imageBuffer = await image.arrayBuffer()
    const imageChunk = new Uint8Array(imageBuffer)
    const imageFile = new ZipPassThrough(`${i + 1}.png`)
    zip.add(imageFile)
    imageFile.push(imageChunk, true)

    const metadataFile = new ZipDeflate(`${i + 1}.json`, { level: 9 })   
    zip.add(metadataFile)
    metadataFile.push(str2ab(JSON.stringify(metadata)), true)
    fullMetadataFile.push(str2ab(JSON.stringify(metadata)))

    if (i < amount - 1) {
      fullMetadataFile.push(str2ab(","))
    }


    // eslint-disable-next-line
    self.postMessage({type: "progress", progress: `${i + 1}`, image, metadata})
  }

  fullMetadataFile.push(str2ab("]"), true)

  zip.end()
  zip.terminate()
}

async function generateNonDuplicateImage(traits, fileMap, metadataKeys, avoidDuplicates = true, attempt = 1) {
  let [image, metadata] = await generateRandomImage(traits, fileMap)
  const virtualTraitNames = traits.filter(({ virtual }) => virtual).map(({ displayName }) => displayName)
  let metadataKey = metadata.filter(({ trait_type }) => !virtualTraitNames.includes(trait_type)).reduce((k, { trait_type, value }) => k +`${trait_type}:${value};`, "")
  let duplicate = false

  if (avoidDuplicates && metadataKeys.includes(metadataKey)) {
    if (attempt < 15) {
      return await generateNonDuplicateImage(traits, fileMap, metadataKeys, avoidDuplicates, attempt + 1)
    } else {
      duplicate = true
    }
  }

  return [image, metadata, metadataKey, duplicate]
}

onmessage = async (e) => {
  const { amount, traits, zipFile } = e.data
  generateAssetsZipFile(amount, traits, zipFile)
}
