import React, { useMemo, useRef, useState } from "react"
import JSZip, { JSZipObject } from "jszip"
import mergeImages from "merge-images"

import TraitsList, {
  Trait,
  TraitValue,
  TraitEmptyValue,
} from "../components/TraitsList"
import { stringify } from "querystring"
import { Button } from "react-bootstrap"

type TraitsMap = Record<string, Trait>
type TraitFilesMap = Record<string, Record<string, JSZipObject>>

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [mergedImageBase64, setMergedImageBase64] = useState<string>()
  const traitFilesMapRef = useRef<TraitFilesMap>()

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

            traitFilesMapRef.current = {
              ...traitFilesMapRef.current,
              [traitName]: {
                ...(traitFilesMapRef.current &&
                  traitFilesMapRef.current[traitName]),
                [newValueName]: file,
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

    let updatedTraits: Record<string, Trait> = {
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

    const sumOfDistributionsOfTrait = Object.values(
      updatedTraits[traitName].values
    )
      .filter((v) => v.name !== "none")
      .reduce((t, v) => (t += v.distribution), 0)

    const distributionOffset = 100 - sumOfDistributionsOfTrait
    const traitEmptyValue: TraitEmptyValue = {
      name: "none",
      distribution: distributionOffset,
    }

    if (distributionOffset > 0) {
      updatedTraits = {
        ...updatedTraits,
        [traitName]: {
          ...updatedTraits[traitName],
          values: {
            ...updatedTraits[traitName].values,
            none: traitEmptyValue,
          },
        },
      }
    } else {
      delete updatedTraits[traitName].values.none
    }

    setTraitsMap(updatedTraits)
  }

  const generateRandomImageFromTraits = async () => {
    if (!traitsMap) return
    if (!traitFilesMapRef.current) return

    let selectedTraits: Record<string, string> = {}

    for (let traitName in traitsMap) {
      const values = Object.values(traitsMap[traitName].values)
      const weightedValues = values.flatMap((value) =>
        Array<string>(value.distribution * 100).fill(value.name)
      )
      const randomIndex = Math.floor(Math.random() * weightedValues.length)

      if (weightedValues[randomIndex] !== "none") {
        selectedTraits[traitName] = weightedValues[randomIndex]
      }
    }

    const traitFilesImageContents = await Promise.all(
      Object.entries(selectedTraits).map(
        ([traitName, valueName]) =>
          traitFilesMapRef.current &&
          traitFilesMapRef.current[traitName][valueName].async("base64")
      )
    )

    const mergedImage = await mergeImages(
      traitFilesImageContents.map((b64) => `data:image/png;base64,${b64}`)
    )
    setMergedImageBase64(mergedImage)
  }

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
      {traits && (
        <Button onClick={generateRandomImageFromTraits}>
          Generate random image
        </Button>
      )}
      {mergedImageBase64 && <img src={mergedImageBase64} alt="NFT!" />}
    </div>
  )
}

export default RandomGenerator
