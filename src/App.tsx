import React, { useState } from "react"
import "./App.css"
import FileSelector from "./pages/FileSelector"
import { Container } from "react-bootstrap"
import RandomGenerator from "./pages/RandomGenerator"
import Results from "./pages/Results"

function App() {
  const [file, setFile] = useState<File>()
  const [resultsFile, setResultsFile] = useState<File>()

  return (
    <Container fluid style={{ height: "100vh" }}>
      {!file ? (
        <FileSelector onFileDrop={setFile} />
      ) : !resultsFile ? (
        <RandomGenerator assetsFile={file} onFinish={setResultsFile} />
      ) : (
        <Results file={resultsFile} />
      )}
    </Container>
  )
}

export default App
