import React, { useEffect, useState } from "react"
import JSZip, { JSZipObject } from "jszip"
import { Col, Row, Image, ListGroup, ListGroupItem } from "react-bootstrap"

import Logo from "../images/neeftees-logo-transparent.png"

type ResultsProps = {
  file: File
}

type Stats = Record<string, Record<string, number>>

const Results = ({ file }: ResultsProps) => {
  const [metadataFiles, setMetadataFiles] = useState<JSZipObject[]>()
  const [imageFiles, setImageFiles] = useState<JSZipObject[]>()
  const [stats, setStats] = useState<Stats>()

  useEffect(() => {
    const loadZipFile = async () => {
      const zip = await JSZip.loadAsync(file)

      const metadata: JSZipObject[] = []
      const images: JSZipObject[] = []
      let stats: Stats = {}

      for (let [fileName, file] of Object.entries(zip.files)) {
        if (fileName.endsWith(".png")) {
          images.push(file)
        } else {
          metadata.push(file)
          const res = await file.async("string")
          const metadataJSON = JSON.parse(res)

          let metadataStats = stats
          metadataJSON.forEach(
            ({ trait_type, value }: { trait_type: string; value: string }) => {
              metadataStats = {
                ...metadataStats,
                [trait_type]: {
                  ...metadataStats[trait_type],
                  [value]: metadataStats[trait_type]
                    ? (metadataStats[trait_type][value] || 0) + 1
                    : 1,
                },
              }
            }
          )
          stats = metadataStats
        }
      }

      setMetadataFiles(metadata)
      setImageFiles(images)
      setStats(stats)
    }

    loadZipFile()
  }, [file])

  return (
    <Col sm={12}>
      <Row
        style={{
          paddingTop: "2em",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Col sm={1}>
          <Image src={Logo} alt="neeftees logo" width={50} />
        </Col>
        <Col>
          <h1>Results & stats</h1>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          {stats && (
            <ListGroup>
              {Object.entries(stats).map(([trait, values]) => {
                return (
                  <ListGroup.Item>
                    <h5>{trait}</h5>
                    <ListGroup>
                      {Object.entries(values).map(([valueName, amount]) => {
                        return (
                          <ListGroup.Item>
                            {valueName}: {amount}
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Col>
  )
}

export default Results
