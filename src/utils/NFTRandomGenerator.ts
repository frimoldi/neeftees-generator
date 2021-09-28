import JSZip from "jszip"
import mergeImages from "merge-images"
import { Trait, TraitValue } from "../components/TraitsList"

export type NFTAttribute = {
  trait_type: string
  value: string
}

export type Base64Image = string

export type FileMap = Record<string, Record<string, JSZip.JSZipObject>>

const buildImageFromAttributes = async (
  attributes: NFTAttribute[],
  files: FileMap
): Promise<Base64Image> => {
  const traitFilesImageContents = await Promise.all(
    attributes.map(({ trait_type, value }) =>
      files[trait_type][value].async("base64")
    )
  )

  const mergedImage = await mergeImages(
    traitFilesImageContents.map((b64) => `data:image/png;base64,${b64}`)
  )

  return mergedImage
}

const buildRandomAtrributes = (traits: Trait[]): NFTAttribute[] => {
  let selectedAttributes: NFTAttribute[] = []

  for (let i = 0; i < traits.length; i++) {
    const values = Object.values(traits[i].values)
    const weightedValues = values.flatMap((value) =>
      Array<string>(value.distribution * 100).fill(value.name)
    )
    const randomIndex = Math.floor(Math.random() * weightedValues.length)

    if (weightedValues[randomIndex] !== "none") {
      selectedAttributes = [
        ...selectedAttributes,
        {
          trait_type: traits[i].name,
          value: weightedValues[randomIndex],
        },
      ]
    }
  }

  return selectedAttributes
}

export const generateRandomImage = async (
  traits: Trait[],
  files: FileMap
): Promise<[Base64Image, NFTAttribute[]]> => {
  const attributes = buildRandomAtrributes(traits)
  const image = await buildImageFromAttributes(attributes, files)

  return [image, attributes]
}

export const buildTraitsMapFromZip = async (
  file: File
): Promise<[Record<string, Trait>, FileMap]> => {
  const zip = await JSZip.loadAsync(file)

  let newTraits: Record<string, Trait> = {}
  let fileMap: FileMap = {}

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

        const newValueName = valueName.substring(0, valueName.lastIndexOf("."))
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

        fileMap = {
          ...fileMap,
          [traitName]: {
            ...fileMap[traitName],
            [newValueName]: file,
          },
        }
      }
    })

  return [newTraits, fileMap]
}
