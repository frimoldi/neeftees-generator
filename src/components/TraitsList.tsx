import React from "react"
import {
  Row,
  ListGroup,
  Tab,
  Col,
  InputGroup,
  FormControl,
  Button,
} from "react-bootstrap"
import { BsExclude } from "react-icons/bs"

export type TraitValue = {
  name: string
  distribution: number
}

export type TraitEmptyValue = TraitValue & {
  name: "none"
}

export type Trait = {
  name: string
  displayName: string
  virtual: boolean
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
  onTraitVirtualityChange: (traitName: string, virtual: boolean) => void
}

const TraitsList = ({
  traits,
  onTraitValueDistributionChange,
  onTraitVirtualityChange,
}: Props) => {
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
                  href={`#${trait.displayName}`}
                  key={`${trait.displayName}-item`}
                >
                  <Row>
                    <Col sm={1}>
                      <Button
                        style={{
                          opacity: trait.virtual ? 1 : 0.3,
                        }}
                        variant="outline-light"
                        size="sm"
                        onClick={() =>
                          onTraitVirtualityChange(trait.name, !trait.virtual)
                        }
                      >
                        <BsExclude />
                      </Button>
                    </Col>
                    <Col>{trait.displayName}</Col>
                  </Row>
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
                  eventKey={`#${trait.displayName}`}
                  key={`${trait.displayName}-pane`}
                >
                  <div
                    style={{
                      backgroundColor: "rgb(35, 38, 53)",
                      padding: "2em",
                    }}
                  >
                    <h2>
                      {trait.displayName}
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
