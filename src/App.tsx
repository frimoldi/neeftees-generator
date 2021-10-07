import React, { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import FileSelector from "./pages/FileSelector"
import { Container } from "react-bootstrap"
import RandomGenerator from "./pages/RandomGenerator"

function App() {
  const [file, setFile] = useState<File>()
  return (
    <Container fluid style={{ height: "100vh" }}>
      {!file ? <RandomGenerator /> : <FileSelector onFileDrop={setFile} />}
    </Container>
  )
}

export default App
