import React, { useState } from "react"
import { Switch, Route } from "react-router-dom"
import "./App.css"
import FileSelector from "./pages/FileSelector"
import { Container } from "react-bootstrap"
import RandomGenerator, { TraitsMap } from "./pages/RandomGenerator"
import Results from "./pages/Results"
import HowItWorks from "./pages/HowItWorks"

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
      <Switch>
        <Route path="/" exact>
          {!file ? (
            <FileSelector onFileDrop={setFile} />
          ) : !resultsFile ? (
            <RandomGenerator
              assetsFile={file}
              onFinish={handleGeneratorFinish}
            />
          ) : (
            traitsMap && <Results file={resultsFile} traitsMap={traitsMap} />
          )}
        </Route>
        <Route path="/how-it-works">
          <HowItWorks />
        </Route>
      </Switch>
    </Container>
  )
}

export default App
