import React from "react"
import {
  Row,
  ListGroup,
  Tab,
  Col,
  InputGroup,
  FormControl,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap"
import { BsInfoCircle } from "react-icons/bs"

export type TraitValue = {
  name: string
  distribution: number
}

export type TraitEmptyValue = TraitValue & {
  name: "none"
}

export type Trait = {
  name: string
  values: Record<string, TraitValue | TraitEmptyValue>
}
export type Traits = Trait[]

type Props = {
  traits: Traits
  onTraitValueDistributionChange: (
    traitName: string,
    traitValueName: string,
    distribution: number
  ) => void
}

const TraitsList = ({ traits, onTraitValueDistributionChange }: Props) => {
  const handleDistributionChange = (
    traitName: string,
    traitValueName: string
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDistributionValue = e.target.valueAsNumber

      if (newDistributionValue > 100) {
        e.stopPropagation()
        return
      }

      onTraitValueDistributionChange(
        traitName,
        traitValueName,
        newDistributionValue
      )
    }
  }

  return (
    <Tab.Container>
      <Row>
        <Col>
          <div
            style={{
              backgroundColor: "rgb(35, 38, 53)",
              padding: "2em",
            }}
          >
            <h2>Traits</h2>
            <ListGroup>
              {traits.map((trait) => (
                <ListGroup.Item
                  action
                  href={`#${trait.name}`}
                  key={`${trait.name}-item`}
                >
                  {trait.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
        <Col>
          <Tab.Content>
            {traits.map((trait) => {
              const isOptional = Object.values(trait.values).some(
                (v) => v.name === "none"
              )
              return (
                <Tab.Pane
                  eventKey={`#${trait.name}`}
                  key={`${trait.name}-pane`}
                >
                  <div
                    style={{
                      backgroundColor: "rgb(35, 38, 53)",
                      padding: "2em",
                    }}
                  >
                    <h2>
                      {trait.name}
                      {isOptional && (
                        <small className="text-muted"> - optional </small>
                      )}
                    </h2>
                    <ListGroup>
                      {Object.values(trait.values).map((value) => (
                        <ListGroup.Item key={`${value.name}-item`}>
                          <Row>
                            <Col>{value.name}</Col>
                            <Col>
                              <InputGroup>
                                <FormControl
                                  value={value.distribution}
                                  type="number"
                                  onChange={handleDistributionChange(
                                    trait.name,
                                    value.name
                                  )}
                                />
                                <InputGroup.Text>%</InputGroup.Text>
                              </InputGroup>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </Tab.Pane>
              )
            })}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}

export default TraitsList
