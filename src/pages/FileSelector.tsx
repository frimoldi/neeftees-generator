import React, { useState } from "react"
import { Stack, Alert } from "react-bootstrap"
import { BsFileEarmarkZip } from "react-icons/bs"

import { validateZipFileContent } from "../utils/assetsZipFile"

type Props = {
  onFileDrop: (file: File) => void
}

type ValidationError = "not-a-zip" | "invalid-directory-structure"

const VALID_ZIP_TYPES = ["application/zip", "application/x-gzip"]
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
  const [draggingOver, setDraggingOver] = useState(false)
  const [errorMessageClosed, setErrorMessageClosed] = useState(false)
  const [lastErrorMessage, setLastErrorMessage] = useState<string>()

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
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        color: "white",
      }}
    >
      <Alert
        show={!!lastErrorMessage && !errorMessageClosed}
        onClose={() => setErrorMessageClosed(true)}
        variant="danger"
        dismissible
      >
        {lastErrorMessage}
      </Alert>
      <h4>Drop your zip file down here 👇</h4>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: "1px dashed #A4C0D5",
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
      </div>
    </Stack>
  )
}

export default FileSelector
