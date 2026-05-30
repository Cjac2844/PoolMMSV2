import React from 'react';
import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { Person } from '../types/Person';

interface PersonListProps {
  people: Person[];
  onRemovePerson: (id: string) => void;
}

function PersonList({ people, onRemovePerson }: PersonListProps) {
  if (people.length === 0) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <p className="text-muted mb-0">No one checked in yet. Search to sign someone in!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          Checked In: <Badge bg="success">{people.length}</Badge>
        </Card.Title>
      </Card.Header>
      <ListGroup variant="flush">
        {people.map((person) => (
          <ListGroup.Item key={person.id}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">
                  {person.firstName} {person.lastName}
                </h6>
                <small className="text-muted">
                  Signed in at {new Date(person.checkedInTime).toLocaleTimeString()}
                </small>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onRemovePerson(person.id)}
              >
                Remove
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}

export default PersonList;