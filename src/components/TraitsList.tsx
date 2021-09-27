import React from "react"
import {
  Row,
  ListGroup,
  Tab,
  Col,
  Form,
  InputGroup,
  FormControl,
} from "react-bootstrap"

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
            {traits.map((trait) => (
              <Tab.Pane eventKey={`#${trait.name}`}>
                <h2>{trait.name}</h2>
                <Form.Switch
                  type="switch"
                  id={`switch_${trait.name}`}
                  label="Required"
                />
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
            ))}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}

export default TraitsList
