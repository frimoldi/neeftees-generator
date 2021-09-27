import React from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"
import RandomGenerator from "./pages/RandomGenerator"
import { Container } from "react-bootstrap"

function App() {
  return (
    <Container fluid>
      <RandomGenerator />
    </Container>
  )
}

export default App
