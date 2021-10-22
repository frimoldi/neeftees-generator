import React, { useState } from "react"
import "./App.css"
import FileSelector from "./pages/FileSelector"
import { Container } from "react-bootstrap"
import RandomGenerator, { TraitsMap } from "./pages/RandomGenerator"
import Results from "./pages/Results"

function App() {
  const [file, setFile] = useState<File>()
  const [resultsFile, setResultsFile] = useState<File>()
  const [traitsMap, setTraitsMap] = useState<TraitsMap>()

  const handleGeneratorFinish = (file: File, traitsMap: TraitsMap) => {
    setResultsFile(file)
    setTraitsMap(traitsMap)
  }

  return (
    <Container fluid style={{ height: "100vh" }}>
      {!file ? (
        <FileSelector onFileDrop={setFile} />
      ) : !resultsFile ? (
        <RandomGenerator assetsFile={file} onFinish={handleGeneratorFinish} />
      ) : (
        traitsMap && <Results file={resultsFile} traitsMap={traitsMap} />
      )}
    </Container>
  )
}

export default App
