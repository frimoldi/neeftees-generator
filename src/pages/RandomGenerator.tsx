import React, { useState } from "react"
import JSZip from "jszip"
import mergeImages from "merge-images"

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] =
    useState<Record<string, JSZip.JSZipObject[]>>()
  const [mergedImageBase64, setMergedImageBase64] = useState<string>()

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0]

      console.log(`File name: ${file.name}`)
      console.log(`File size: ${file.size}`)

      const zip = await JSZip.loadAsync(file)

      console.log(`File loaded`)

      const newTraitsMap: Record<string, JSZip.JSZipObject[]> = {}

      zip
        .filter((relativePath, zipEntry) => {
          return !relativePath.startsWith("__MACOSX")
        })
        .forEach((file) => {
          if (file.dir) {
            // remove the trailing '/' from directory name
            const traitName = file.name.slice(0, -1)
            newTraitsMap[traitName] = []
          } else {
            const traitName = file.name.split("/")[0]
            newTraitsMap[traitName] = [...newTraitsMap[traitName], file]
          }
        })

      setTraitsMap(newTraitsMap)
    }
  }

  const generateRandomImageFromTraits = async () => {
    if (!traitsMap) return

    const selectedTraits: Record<string, JSZip.JSZipObject> = {}
    Object.entries(traitsMap).forEach(([traitName, traitFiles]) => {
      const randomIndex = Math.floor(Math.random() * traitFiles.length)
      selectedTraits[traitName] = traitFiles[randomIndex]
    })

    const traitFilesImageContents = await Promise.all(
      Object.values(selectedTraits).map((traitFile) =>
        traitFile.async("base64")
      )
    )

    const mergedImage = await mergeImages(
      traitFilesImageContents.map((b64) => `data:image/png;base64,${b64}`)
    )
    setMergedImageBase64(mergedImage)
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      <input type="file" name="assetsFile" onChange={handleOnChange} />
      <hr />
      {traitsMap && (
        <button onClick={generateRandomImageFromTraits}>
          Generate random image
        </button>
      )}
      {mergedImageBase64 && (
        <img src={mergedImageBase64} alt="Fresh randomly generated NFT!" />
      )}
    </div>
  )
}

export default RandomGenerator
