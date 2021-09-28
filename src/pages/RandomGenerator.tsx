import React, { useMemo, useRef, useState } from "react"
import JSON from "json5"
import {
  generateRandomImage,
  buildTraitsMapFromZip,
  NFTAttribute,
  Base64Image,
  FileMap as TraitFilesMap,
} from "../utils/NFTRandomGenerator"

import TraitsList, { Trait, TraitEmptyValue } from "../components/TraitsList"
import { Button, Col, Form, Row } from "react-bootstrap"

type TraitsMap = Record<string, Trait>

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [mergedImageBase64, setMergedImageBase64] = useState<Base64Image>()
  const [selectedTraits, setSelectedTraits] = useState<NFTAttribute[]>()
  const traitFilesMapRef = useRef<TraitFilesMap>()

  const traits = useMemo(
    () => traitsMap && Object.values(traitsMap),
    [traitsMap]
  )

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0]

      const [newTraits, fileMap] = await buildTraitsMapFromZip(file)

      traitFilesMapRef.current = fileMap

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

    const [image, attributes] = await generateRandomImage(
      Object.values(traitsMap),
      traitFilesMapRef.current
    )

    setMergedImageBase64(image)
    setSelectedTraits(attributes)
  }

  return (
    <Col sm={12}>
      <Row>
        <Form.File type="file" name="assetsFile" onChange={handleOnChange} />
      </Row>
      <hr />
      <Row>
        <Col sm={8}>
          {traits && (
            <TraitsList
              traits={traits}
              onTraitValueDistributionChange={handleDistributionChange}
            />
          )}
        </Col>
        <Col sm={4}>
          <Row>
            {traits && (
              <Button onClick={generateRandomImageFromTraits}>
                Test random image
              </Button>
            )}
          </Row>
          {mergedImageBase64 && (
            <Row>
              <img src={mergedImageBase64} alt="NFT!" />
            </Row>
          )}
          {selectedTraits && (
            <>
              <Row>
                <h6>Metadata</h6>
              </Row>
              <Row>
                <pre>
                  <code>{JSON.stringify(selectedTraits, null, 2)}</code>
                </pre>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Col>
  )
}

export default RandomGenerator
