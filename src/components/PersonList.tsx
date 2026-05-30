import React from 'react';
import { Button, Badge, Card, Table } from 'react-bootstrap';
import { Person } from '../types/Person';

interface PersonListProps {
  people: Person[];
  onSignOut: (person: Person) => void;
  onSelectPerson: (person: Person) => void;
}

function PersonList({ people, onSignOut, onSelectPerson }: PersonListProps) {
  if (people.length === 0) {
    return null;
  }

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Checked-In Members</h5>
        <Badge bg="secondary">{people.length}</Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Type</th>
              <th>In At</th>
              <th>Sign Out</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} onClick={() => onSelectPerson(person)} className="selectable-row">
                <td>{person.firstName}</td>
                <td>{person.lastName}</td>
                <td>{person.personType ?? 'Swim Club Membership'}</td>
                <td>{new Date(person.checkedInTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSignOut(person);
                    }}
                  >
                    SIGN OUT
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default PersonList;