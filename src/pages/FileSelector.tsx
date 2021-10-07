import React, { useState } from "react"
import { Stack } from "react-bootstrap"

type Props = {
  onFileDrop: (file: File) => void
}

const FileSelector = ({ onFileDrop }: Props) => {
  const [draggingOver, setDraggingOver] = useState(false)

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setDraggingOver(false)

    const file = e.dataTransfer.files[0]
    onFileDrop(file)
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
      ></div>
    </Stack>
  )
}

export default FileSelector
