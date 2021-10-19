import React, { useEffect, useState } from "react"
import JSZip, { JSZipObject } from "jszip"
import { Col, Row, Image, ListGroup, ListGroupItem } from "react-bootstrap"

import Logo from "../images/neeftees-logo-transparent.png"

type ResultsProps = {
  file: File
}

type Stats = Record<string, Record<string, number>>

const Results = ({ file }: ResultsProps) => {
  const [assetsMetadata, setAssetsMetadata] =
    useState<Record<string, string>[]>()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<JSZipObject[]>()
  const [stats, setStats] = useState<Stats>()
  const [duplicates, setDuplicates] = useState(0)

  useEffect(() => {
    const loadZipFile = async () => {
      setIsLoading(true)
      const zip = await JSZip.loadAsync(file)

      const metadata: Record<string, string>[] = []
      const images: JSZipObject[] = []
      let stats: Stats = {}
      let assetsMetadataKeys: string[] = []
      let duplicatesFound = 0

      for (let [fileName, file] of Object.entries(zip.files)) {
        if (fileName.endsWith(".png")) {
          images.push(file)
        } else {
          const res = await file.async("string")
          const metadataJSON = JSON.parse(res)
          metadata.push(metadataJSON)

          let metadataStats = stats
          let assetMetadataKey = ""
          metadataJSON.forEach(
            ({ trait_type, value }: { trait_type: string; value: string }) => {
              assetMetadataKey += `${trait_type}:${value};`
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

          if (assetsMetadataKeys.includes(assetMetadataKey)) {
            duplicatesFound++
          } else {
            assetsMetadataKeys.push(assetMetadataKey)
          }

          stats = metadataStats
        }
      }

      setAssetsMetadata(metadata)
      setImageFiles(images)
      setStats(stats)
      setDuplicates(duplicatesFound)
      setIsLoading(false)
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
          <h1>
            {isLoading ? "Loading results & stats ..." : "Results & stats"}
          </h1>
        </Col>
      </Row>
      <hr />
      <Row>
        <ul>
          <li>{`Total #: ${assetsMetadata?.length}`}</li>
          <li>{`Duplicates: ${duplicates} ${
            duplicates === 0 ? "✅" : "🔴"
          }`}</li>
        </ul>
      </Row>
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
