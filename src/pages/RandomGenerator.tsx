import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import {
  Button,
  Col,
  Row,
  InputGroup,
  FormControl,
  ProgressBar,
  Image,
  Stack,
  Modal,
} from "react-bootstrap"
import { BsTwitter } from "react-icons/bs"
import { FaEthereum } from "react-icons/fa"
import {
  buildTraitsMapFromZip,
  FileMap as TraitFilesMap,
} from "../utils/NFTRandomGenerator"
import TraitsList, { Trait, TraitEmptyValue } from "../components/TraitsList"
import Logo from "../images/neeftees-logo-transparent.png"
import {
  logGenerationStarted,
  logGenerationEnded,
  logAssetsFileProcessed,
} from "../utils/analytics/generator"
import { logTwitterClick } from "../utils/analytics/general"

// @ts-ignore
// eslint-disable-next-line
import Worker from "worker-loader!../utils/createAssetsZipFile.js"

const worker = new Worker()

type TraitsMap = Record<string, Trait>

type Props = {
  assetsFile: File
  onFinish: (file: File) => void
}

const RandomGenerator = ({ assetsFile, onFinish }: Props) => {
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()
  const [assetsAmount, setAssetsAmount] = useState(10)
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false)
  const [progress, setProgress] = useState()
  const [finishedModalOpen, setFinishedModalOpen] = useState(false)
  const [currentImageBlob, setCurrentImageBlob] = useState<Blob>()
  const traitFilesMapRef = useRef<[File, TraitFilesMap]>()
  const zipWriter = useRef<FileSystemWritableFileStream>()
  const resultsFileHandle = useRef<FileSystemFileHandle>()

  const traits = useMemo(
    () =>
      traitsMap &&
      Object.values(traitsMap).sort((a, b) => (a.name > b.name ? 1 : -1)),
    [traitsMap]
  )

  const handleWorkerMessage = useCallback(
    async (msg: MessageEvent) => {
      if (!zipWriter.current) return

      if (msg.data.type === "progress") {
        setProgress(msg.data.progress)
        setCurrentImageBlob(msg.data.image)
      } else if (msg.data.type === "data") {
        const { data } = msg.data
        await zipWriter.current.write(data)
      } else if (msg.data.type === "done") {
        await zipWriter.current.close()

        zipWriter.current = undefined
        setIsGeneratingAssets(false)

        setFinishedModalOpen(true)
        logGenerationEnded()

        const resultsFile = await resultsFileHandle.current?.getFile()
        resultsFile && onFinish(resultsFile)
        console.log(resultsFile)
      }
    },
    [onFinish]
  )

  useEffect(() => {
    worker.addEventListener("message", handleWorkerMessage)

    return () => worker.removeEventListener("message", handleWorkerMessage)
  }, [handleWorkerMessage])

  useEffect(() => {
    const buildTraitsMap = async () => {
      const [newTraits, fileMap] = await buildTraitsMapFromZip(assetsFile)

      traitFilesMapRef.current = [assetsFile, fileMap]

      setTraitsMap(newTraits)
      logAssetsFileProcessed(
        Object.values(newTraits).length,
        Object.values(newTraits).reduce<number>(
          (s, trait) => s + Object.values(trait.values).length,
          0
        )
      )
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

    resultsFileHandle.current = fileHandle
    zipWriter.current = writer

    const [file] = traitFilesMapRef.current

    setIsGeneratingAssets(true)

    worker.postMessage({
      amount: assetsAmount,
      traits,
      zipFile: file,
      fileHandle: fileHandle,
    })

    logGenerationStarted(assetsAmount)
  }

  return (
    <>
      <Modal centered show={finishedModalOpen}>
        <Modal.Header>
          <h2>Congrats!</h2>
        </Modal.Header>
        <Modal.Body>
          <p>
            You just randomly generated {assetsAmount} images based on your
            traits and values, along with their metadata files.
          </p>
          <p>You can now go and check them out!</p>
          <p>
            Ah, if you found this tool useful, please consider giving me a tip
            at the ETH address down below. Also, a shout out on twitter would
            make my day 🙂
          </p>
          <p>
            <a
              href="https://twitter.com/fran_rimoldi"
              target="_blank"
              rel="noreferrer"
              onClick={() => logTwitterClick()}
            >
              <BsTwitter /> @fran_rimoldi
            </a>
          </p>
          <p>
            <small>
              <FaEthereum /> frimoldi.eth
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setFinishedModalOpen(false)}>OK</Button>
        </Modal.Footer>
      </Modal>
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
              <small>
                Note: remember to save your file as a .zip or similar
              </small>
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
    </>
  )
}

export default RandomGenerator
