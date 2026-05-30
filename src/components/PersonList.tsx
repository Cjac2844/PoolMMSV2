import React from 'react';
import { ListGroup, Button, Badge } from 'react-bootstrap';
import { Person } from '../types/Person';

interface PersonListProps {
  people: Person[];
  onRemovePerson: (id: string) => void;
}

function PersonList({ people, onRemovePerson }: PersonListProps) {
  if (people.length === 0) {
    return null;
  }

  return (
    <div className="person-list-container">
      <div className="person-list-header">
        <h5 className="mb-0">
          Checked In: <Badge bg="success">{people.length}</Badge>
        </h5>
      </div>
      <ListGroup variant="flush" className="person-list">
        {people.map((person) => (
          <ListGroup.Item key={person.id} className="person-list-item">
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
    </div>
  );
}

export default PersonList;