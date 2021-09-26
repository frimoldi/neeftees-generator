import React, { useState } from "react"
import JSZip from "jszip"
import mergeImages from "merge-images"

type TraitsMap = Record<string, Record<string, JSZip.JSZipObject>>

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [mergedImageBase64, setMergedImageBase64] = useState<string>()

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0]

      console.log(`File name: ${file.name}`)
      console.log(`File size: ${file.size}`)

      const zip = await JSZip.loadAsync(file)

      console.log(`File loaded`)

      const newTraitsMap: TraitsMap = {}

      zip
        .filter((relativePath, zipEntry) => {
          return !relativePath.startsWith("__MACOSX")
        })
        .forEach((file) => {
          if (file.dir) {
            // remove the trailing '/' from directory name
            const traitName = file.name.slice(0, -1)
            newTraitsMap[traitName] = {}
          } else {
            const [traitName, valueName] = file.name.split("/")
            newTraitsMap[traitName] = {
              ...newTraitsMap[traitName],
              [valueName]: file,
            }
          }
        })

      setTraitsMap(newTraitsMap)
    }
  }

  const generateRandomImageFromTraits = async () => {
    if (!traitsMap) return

    const selectedTraits: Record<string, string> = {}
    Object.entries(traitsMap).forEach(([traitName, traitValues]) => {
      const values = Object.entries(traitValues)
      const randomIndex = Math.floor(Math.random() * values.length)
      const [traitValue] = values[randomIndex]
      selectedTraits[traitName] = traitValue
    })

    const traitFilesImageContents = await Promise.all(
      Object.entries(selectedTraits).map(([traitName, valueName]) =>
        traitsMap[traitName][valueName].async("base64")
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
