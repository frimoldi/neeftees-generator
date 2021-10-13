import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  Button,
  Col,
  Row,
  InputGroup,
  FormControl,
  ProgressBar,
  Image,
  Stack,
} from "react-bootstrap"
import {
  buildTraitsMapFromZip,
  FileMap as TraitFilesMap,
} from "../utils/NFTRandomGenerator"
import TraitsList, { Trait, TraitEmptyValue } from "../components/TraitsList"
import Logo from "../images/neeftees-logo-transparent.png"

// @ts-ignore
// eslint-disable-next-line
import Worker from "worker-loader!../utils/createAssetsZipFile.js"

const worker = new Worker()

type TraitsMap = Record<string, Trait>

type Props = {
  assetsFile: File
}

const RandomGenerator = ({ assetsFile }: Props) => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [assetsAmount, setAssetsAmount] = useState(10)
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)
  const [progress, setProgress] = useState()
  const [currentImageBlob, setCurrentImageBlob] = useState<Blob>()
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
      setCurrentImageBlob(msg.data.image)
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

  useEffect(() => {
    const buildTraitsMap = async () => {
      const [newTraits, fileMap] = await buildTraitsMapFromZip(assetsFile)

      traitFilesMapRef.current = [assetsFile, fileMap]

      setTraitsMap(newTraits)
    }

    buildTraitsMap()
  }, [assetsFile])

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
      <Row style={{ paddingTop: "2em" }}>
        <Col sm={1}>
          <Image src={Logo} alt="neeftees logo" width={44} />
        </Col>
        <Col>
          <h6>How it works?</h6>
          <ol>
            <li>Play with your traits and determine rarity</li>
            <li>Enter how many assets you want to generate</li>
            <li>Save it as a .zip file</li>
          </ol>
        </Col>
        {traitsMap && (
          <Col sm={4}>
            <small>How many assets do you want to generate?</small>
            <InputGroup>
              <FormControl
                value={assetsAmount}
                onChange={handleAmountChange}
                type="number"
                disabled={isGeneratingAssets}
              />

              <Button
                onClick={handleGenerateAssets}
                disabled={isGeneratingAssets}
              >
                {isGeneratingAssets
                  ? "Generating assets ..."
                  : "Generate assets!"}
              </Button>
            </InputGroup>
            <small>Note: remember to save your file as a .zip or similar</small>
          </Col>
        )}
      </Row>
      <Row style={{ marginTop: "20px" }}>
        <Col>
          {isGeneratingAssets && progress && (
            <ProgressBar
              now={(progress / assetsAmount) * 100}
              label={
                progress < assetsAmount
                  ? `${progress}/${assetsAmount}`
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
          {traits && !isGeneratingAssets && (
            <TraitsList
              traits={traits}
              onTraitValueDistributionChange={handleDistributionChange}
            />
          )}
          {isGeneratingAssets && currentImageBlob && (
            <Stack
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Image
                src={URL.createObjectURL(currentImageBlob)}
                style={{ maxWidth: "80%" }}
              />
            </Stack>
          )}
        </Col>
      </Row>
    </Col>
  )
}

export default RandomGenerator
