import React from "react"
import { Col, Row, Image } from "react-bootstrap"

import Logo from "../images/neeftees-logo-transparent.png"
import FolderStructureExample from "../images/folder-structure-example.png"
import RarityMapExample from "../images/rarity-map-example.png"
import DuplicateTraits from "../images/duplicate-traits.png"
import SaveAsZip from "../images/save-as-zip.png"

const HowItWorks = () => {
  return (
    <Col
      sm={{
        offset: 1,
        span: 10,
      }}
    >
      <Row style={{ marginTop: "20px" }}>
        <Col sm={1}>
          <Image src={Logo} width={44} />
        </Col>
        <Col>
          <h1>Generative art random generator</h1>
        </Col>
      </Row>
      <Row style={{ marginTop: "20px" }}>
        <h2>- What is it?</h2>
        <p>
          It's a tool that turns image layers into random, code generated
          artwork. It works 100% on your browser and it requires you to know
          absolutely nonthing about coding.
        </p>
        <h2>- Step 1: the zip file</h2>
        <p>
          It all starts with a .zip file containing all your assets. But it
          needs to be structured in a specific way:{" "}
          <strong>
            each trait should be a folder containing all possible values as .png
            images
          </strong>
          .
        </p>
        <p>Example 👇</p>
        <Col sm={6} style={{ marginBottom: "20px" }}>
          <Image src={FolderStructureExample} width="100%" />
        </Col>
        <h2>- Step 2: naming</h2>
        <p>
          The name of the traits & values will be determined by the name of the
          folders & files. The example from above will generate a trait called
          "background" and a value called "black".
        </p>
        <h2>- Step 3: ordering</h2>
        <p>
          By default, the layers will be ordered alphabetically by their names.
          So, in order to set the right order for your layers, you can simply
          add numbers at the beginning of the folder's name. For example:
          01Background, 02Base, 03Face, etc. The numbers will be trimmed and the
          name of the traits will still be "Background", "Base", "Face", etc.
        </p>
        <h2>- Step 4: rarity map</h2>
        <p>
          The app will read your .zip file and build a "rarity map". A rarity
          map is a table where all your traits and values are displayed, along
          with their probability. The algorithm will use this probability to
          randomly select traits while building the final images.
        </p>
        <Col sm={10}>
          <Image src={RarityMapExample} width="100%" />
        </Col>
        <h2>- Step 5: avoiding duplicates</h2>
        <p>
          The algorithm will do its best to avoid generating duplicate images (2
          or more images with the exact same traits). By default, all traits are
          included in this calculation. e.g: 2 images with the exact same
          traits, but different backgrounds, are still considered
          non-duplicates. You might want to avoid that, too.
        </p>
        <p>
          In this case, you can exclude a trait from the duplicates calculation
          by clicking on the button on the left of the trait's name.
        </p>
        <Col sm={10} style={{ marginBottom: "20px" }}>
          <Image src={DuplicateTraits} width="100%" />
        </Col>
        <h2>- Step 6: # of results</h2>
        <p>The last step is to set the # of images you want to generate.</p>
        <h2>- Final: save as .zip file</h2>
        <p>
          You'll be prompted to specify the location where you want your results
          to be saved. Make sure to give the file a name and a ".zip" extension
          to uncompress it later.
        </p>
        <Col sm={10} style={{ marginBottom: "20px" }}>
          <Image src={SaveAsZip} width="100%" />
        </Col>
      </Row>
    </Col>
  )
}

export default HowItWorks
