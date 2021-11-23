import React, { useState } from "react"
import { Stack, Alert, Image, Modal, Button } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { BsFileEarmarkZip } from "react-icons/bs"

import { validateZipFileContent } from "../utils/assetsZipFile"
import Logo from "../images/neeftees-logo-transparent.png"

type Props = {
  onFileDrop: (file: File) => void
}

type ValidationError = "not-a-zip" | "invalid-directory-structure"

const VALID_ZIP_TYPES = [
  "application/zip",
  "application/x-gzip",
  "application/x-zip-compressed",
]

const ZIP_ERROR_MESSAGES: Record<ValidationError, string> = {
  "not-a-zip": "The file must be a .zip",
  "invalid-directory-structure":
    "The directory structure is not set up properly.",
}
const errorMessageFromError = (error: ValidationError) =>
  ZIP_ERROR_MESSAGES[error]

const validateFile = async (
  file: File
): Promise<[boolean, ValidationError[]]> => {
  let errors: ValidationError[] = []

  console.log(file.type)

  if (!VALID_ZIP_TYPES.includes(file.type)) {
    errors.push("not-a-zip")
  } else {
    const zipIsValid = await validateZipFileContent(file)

    if (!zipIsValid) {
      errors.push("invalid-directory-structure")
    }
  }

  return [errors.length === 0, errors]
}

const FileSelector = ({ onFileDrop }: Props) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [draggingOver, setDraggingOver] = useState(false)
  const [errorMessageClosed, setErrorMessageClosed] = useState(false)
  const [lastErrorMessage, setLastErrorMessage] = useState<string>()
  const history = useHistory()

  const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault()
    setDraggingOver(false)

    const file = e.dataTransfer.files[0]
    const [fileIsValid, errors] = await validateFile(file)

    if (fileIsValid) {
      onFileDrop(file)
    } else {
      const errorMessage = errorMessageFromError(errors[0])
      setLastErrorMessage(errorMessage)
      setErrorMessageClosed(false)
    }
  }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDraggingOver(true)
  }

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDraggingOver(false)
  }

  return (
    <Stack
      style={{
        alignItems: "center",
        height: "100%",
        paddingTop: "2em",
      }}
    >
      <Image src={Logo} width={60} alt="neeftees" />

      <h2>A random generator for NFT assets</h2>
      <hr />
      <Button
        size="lg"
        style={{ marginBottom: "20px" }}
        onClick={() => history.push("/how-it-works")}
      >
        How it works?
      </Button>

      <h4>To start, drop your zip file down here 👇</h4>

      <Alert
        show={!!lastErrorMessage && !errorMessageClosed}
        onClose={() => setErrorMessageClosed(true)}
        variant="danger"
        dismissible
      >
        {lastErrorMessage}
      </Alert>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: "1px solid #fff",
          width: "70%",
          height: "400px",
          opacity: draggingOver ? 0.5 : 1,
        }}
      >
        <Stack
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <BsFileEarmarkZip size="6em" />
        </Stack>
        <small>
          The .zip content must be structured properly for the generator to
          work.{" "}
          <Button variant="link" onClick={() => setModalOpen(true)}>
            Learn more about how to do this.
          </Button>
        </small>
        <Modal centered show={modalOpen}>
          <Modal.Header>
            <Modal.Title>ZIP file structure</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <pre className="pre-scrollable">
              - /assets.zip
              <br />
              -- /background
              <br />
              ---- background1.png
              <br />
              ---- background2.png
              <br />
              -- /body
              <br />
              ---- body1.png
              <br />
              ---- body2.png
              <br />
              ---- body3.png
            </pre>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setModalOpen(false)}>Got it</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Stack>
  )
}

export default FileSelector
