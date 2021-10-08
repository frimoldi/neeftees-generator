import React, { useState } from "react"
import { Stack, Alert, Fade, Collapse } from "react-bootstrap"
import { BsFileEarmarkZip } from "react-icons/bs"

type Props = {
  onFileDrop: (file: File) => void
}

type ValidationError = "not-a-zip"

const VALID_ZIP_TYPES = ["application/zip", "application/x-gzip"]
const ZIP_ERROR_MESSAGES: Record<ValidationError, string> = {
  "not-a-zip": "The file must be a .zip",
}
const errorMessageFromError = (error: ValidationError) =>
  ZIP_ERROR_MESSAGES[error]

const validateFile = (file: File): [boolean, ValidationError[]] => {
  let errors: ValidationError[] = []

  if (!VALID_ZIP_TYPES.includes(file.type)) {
    errors.push("not-a-zip")
  }

  return [errors.length === 0, errors]
}

const FileSelector = ({ onFileDrop }: Props) => {
  const [draggingOver, setDraggingOver] = useState(false)
  const [errorMessageClosed, setErrorMessageClosed] = useState(false)
  const [lastErrorMessage, setLastErrorMessage] = useState<string>()

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDraggingOver(false)

    const file = e.dataTransfer.files[0]
    const [fileIsValid, errors] = validateFile(file)

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
      style={{ justifyContent: "center", alignItems: "center", height: "100%" }}
    >
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          backgroundColor: "#F6F6F6",
          border: "5px dashed #A4C0D5",
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
          <Alert
            show={!!lastErrorMessage && !errorMessageClosed}
            onClose={() => setErrorMessageClosed(true)}
            variant="danger"
            dismissible
          >
            {lastErrorMessage}
          </Alert>

          <BsFileEarmarkZip size="6em" />
          <h3>Drop your .zip file right here</h3>
        </Stack>
      </div>
    </Stack>
  )
}

export default FileSelector
