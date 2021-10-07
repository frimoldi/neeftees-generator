import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Button,
  Col,
  Form,
  Row,
  InputGroup,
  FormControl,
  ProgressBar,
} from "react-bootstrap"
import {
  buildTraitsMapFromZip,
  FileMap as TraitFilesMap,
} from "../utils/NFTRandomGenerator"
import TraitsList, { Trait, TraitEmptyValue } from "../components/TraitsList"

// @ts-ignore
// eslint-disable-next-line
import Worker from "worker-loader!../utils/createAssetsZipFile.js"

const worker = new Worker()

type TraitsMap = Record<string, Trait>

const RandomGenerator = () => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [assetsAmount, setAssetsAmount] = useState(10)
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)
  const [progress, setProgress] = useState()
  const traitFilesMapRef = useRef<[File, TraitFilesMap]>()
  const zipWriter = useRef<FileSystemWritableFileStream>()

  const traits = useMemo(
    () => traitsMap && Object.values(traitsMap),
    [traitsMap]
  )

  const handleWorkerMessage = async (msg: MessageEvent) => {
    if (!zipWriter.current) return

    if (msg.data.type === "progress") {
      setProgress(msg.data.progress)
    } else if (msg.data.type === "data") {
      const { data } = msg.data
      await zipWriter.current.write(data)
    } else if (msg.data.type === "done") {
      console.log("Message done came")
      await zipWriter.current.close()
      console.log("Writer closed")

      zipWriter.current = undefined
      setIsGeneratingAssets(false)
    }
  }

  useEffect(() => {
    worker.addEventListener("message", handleWorkerMessage)

    return () => worker.removeEventListener("message", handleWorkerMessage)
  }, [])

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0]

      const [newTraits, fileMap] = await buildTraitsMapFromZip(file)

      traitFilesMapRef.current = [file, fileMap]

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetsAmount(e.target.valueAsNumber)
  }

  const handleGenerateAssets = async () => {
    if (!traits) return
    if (!traitFilesMapRef.current) return

    const fileHandle = await window.showSaveFilePicker()
    const writer = await fileHandle.createWritable()

    zipWriter.current = writer

    console.log("Random generation started")

    const [file] = traitFilesMapRef.current

    setIsGeneratingAssets(true)

    worker.postMessage({
      amount: assetsAmount,
      traits,
      zipFile: file,
      fileHandle: fileHandle,
    })
  }

  return (
    <Col sm={12}>
      <Row style={{ marginTop: "20px" }}>
        <Col>
          <Form.File type="file" name="assetsFile" onChange={handleOnChange} />
        </Col>
        {traitsMap && (
          <Col sm={4}>
            <InputGroup>
              <FormControl
                value={assetsAmount}
                onChange={handleAmountChange}
                type="number"
                disabled={isGeneratingAssets}
              />
              <InputGroup.Append>
                <Button
                  onClick={handleGenerateAssets}
                  disabled={isGeneratingAssets}
                >
                  {isGeneratingAssets
                    ? "Generating assets ..."
                    : "Generate assets!"}
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: "20px" }}>
        <Col>
          {progress && (
            <ProgressBar
              now={(progress / assetsAmount) * 100}
              label={
                progress < assetsAmount
                  ? `Generating assets: ${progress}/${assetsAmount}`
                  : `Done! Generated ${assetsAmount} assets`
              }
              variant={progress < assetsAmount ? "info" : "success"}
            />
          )}
        </Col>
      </Row>
      <hr />
      <Row>
        <Col sm={12}>
          {traits && (
            <TraitsList
              traits={traits}
              onTraitValueDistributionChange={handleDistributionChange}
            />
          )}
        </Col>
      </Row>
    </Col>
  )
}

export default RandomGenerator
