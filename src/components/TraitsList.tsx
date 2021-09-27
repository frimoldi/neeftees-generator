import React from "react"
import {
  Row,
  ListGroup,
  Tab,
  Col,
  Form,
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
        <Col sm={4}>
          <h2>Traits</h2>
          <ListGroup>
            {traits.map((trait) => (
              <ListGroup.Item action href={`#${trait.name}`}>
                {trait.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col sm={4}>
          <Tab.Content>
            {traits.map((trait) => {
              const isOptional = Object.values(trait.values).some(
                (v) => v.name === "none"
              )
              return (
                <Tab.Pane eventKey={`#${trait.name}`}>
                  <h2>
                    {trait.name}
                    {isOptional && (
                      <>
                        <small className="text-muted"> - optional </small>
                        <OverlayTrigger
                          overlay={
                            <Tooltip
                              id={`${trait.name}-optional`}
                              placement="right-end"
                            >
                              This trait was marked as 'optional' because the
                              sum of its values probabilities is less than 100%
                            </Tooltip>
                          }
                        >
                          <BsInfoCircle />
                        </OverlayTrigger>
                      </>
                    )}
                  </h2>
                  <ListGroup>
                    {Object.values(trait.values).map((value) => (
                      <ListGroup.Item>
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
                              <InputGroup.Append>
                                <InputGroup.Text>%</InputGroup.Text>
                              </InputGroup.Append>
                            </InputGroup>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
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
