import React, { useMemo, useState } from "react"
import JSZip from "jszip"
import mergeImages from "merge-images"

import TraitsList, { Trait, TraitValue } from "../components/TraitsList"

type TraitsMap = Record<string, Trait>

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [mergedImageBase64, setMergedImageBase64] = useState<string>()

  const traits = useMemo(
    () => traitsMap && Object.values(traitsMap),
    [traitsMap]
  )

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0]
      const zip = await JSZip.loadAsync(file)

      let newTraits: TraitsMap = {}

      zip
        .filter((relativePath, zipEntry) => {
          return !relativePath.startsWith("__MACOSX")
        })
        .forEach((file) => {
          if (file.dir) {
            // remove the trailing '/' from directory name
            const traitName = file.name.slice(0, -1)
            newTraits = {
              ...newTraits,
              [traitName]: {
                name: traitName,
                values: {},
              },
            }
          } else {
            const [traitName, valueName] = file.name.split("/")
            const valuesInTrait = Object.values(newTraits[traitName].values)
            const valuesWithNewDistribution = valuesInTrait.reduce<
              Record<string, TraitValue>
            >(
              (map, value) => ({
                ...map,
                [value.name]: {
                  ...value,
                  distribution: Math.floor(100 / (valuesInTrait.length + 1)),
                },
              }),
              {}
            )

            const newValueName = valueName.substring(
              0,
              valueName.lastIndexOf(".")
            )
            newTraits = {
              ...newTraits,
              [traitName]: {
                ...newTraits[traitName],
                values: {
                  ...valuesWithNewDistribution,
                  [newValueName]: {
                    name: newValueName,
                    distribution:
                      100 -
                      Object.values(valuesWithNewDistribution).reduce(
                        (t, v) => (t += v.distribution),
                        0
                      ),
                  },
                },
              },
            }
          }
        })

      setTraitsMap(newTraits)
    }
  }

  const handleDistributionChange = (
    traitName: string,
    traitValueName: string,
    distribution: number
  ) => {
    if (!traitsMap) return

    const updatedTraits: Record<string, Trait> = {
      ...traitsMap,
      [traitName]: {
        ...traitsMap[traitName],
        values: {
          ...traitsMap[traitName].values,
          [traitValueName]: {
            ...traitsMap[traitName].values[traitValueName],
            distribution,
          },
        },
      },
    }

    setTraitsMap(updatedTraits)
  }

  // const generateRandomImageFromTraits = async () => {
  //   if (!traitsMap) return

  //   const selectedTraits: Record<string, string> = {}
  //   Object.entries(traitsMap).forEach(([traitName, traitValues]) => {
  //     const values = Object.entries(traitValues)
  //     const randomIndex = Math.floor(Math.random() * values.length)
  //     const [traitValue] = values[randomIndex]
  //     selectedTraits[traitName] = traitValue
  //   })

  //   const traitFilesImageContents = await Promise.all(
  //     Object.entries(selectedTraits).map(([traitName, valueName]) =>
  //       traitsMap[traitName][valueName].async("base64")
  //     )
  //   )

  //   const mergedImage = await mergeImages(
  //     traitFilesImageContents.map((b64) => `data:image/png;base64,${b64}`)
  //   )
  //   setMergedImageBase64(mergedImage)
  // }

  return (
    <div>
      <input type="file" name="assetsFile" onChange={handleOnChange} />
      <hr />
      {traits && (
        <TraitsList
          traits={traits}
          onTraitValueDistributionChange={handleDistributionChange}
        />
      )}
    </div>
  )
}

export default RandomGenerator
