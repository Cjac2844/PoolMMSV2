import React, { useState, useCallback } from 'react';
import { Modal, Form, Button, Table, Card } from 'react-bootstrap';
import { Person } from '../types/Person';

interface DeletePersonModalProps {
  show: boolean;
  onHide: () => void;
  people: Person[];
  checkedInPeople: Person[];
  onDeletePerson: (personId: string) => void;
}

function DeletePersonModal({ show, onHide, people, checkedInPeople, onDeletePerson }: DeletePersonModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);

  const handleSearch = useCallback(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      setFilteredPeople([]);
      return;
    }
    const results = people.filter((person) =>
      person.lastName.toLowerCase().includes(normalizedTerm)
    );
    setFilteredPeople(results);
  }, [searchTerm, people]);

  const isPersonCheckedIn = (personId: string): boolean => {
    return checkedInPeople.some(p => p.id === personId);
  };

  const handleDelete = (person: Person) => {
    if (isPersonCheckedIn(person.id)) {
      alert(`Cannot delete ${person.firstName} ${person.lastName} - they are currently signed in!`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${person.firstName} ${person.lastName}?`)) {
      onDeletePerson(person.id);
      setSearchTerm('');
      setFilteredPeople([]);
      alert(`${person.firstName} ${person.lastName} has been deleted.`);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setFilteredPeople([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Delete Person</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-3">Search for Person to Delete</h5>
        <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-4">
          <Form.Group className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Search by Last Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </Form.Group>
        </Form>

        {filteredPeople.length > 0 && (
          <Table responsive hover>
            <thead>
              <tr>
                <th>FIRST NAME</th>
                <th>LAST NAME</th>
                <th>PERSON TYPE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => {
                const checkedIn = isPersonCheckedIn(person.id);
                return (
                  <tr key={person.id}>
                    <td>{person.firstName}</td>
                    <td>{person.lastName}</td>
                    <td>{person.personType ?? 'Swim Club Membership'}</td>
                    <td>{checkedIn ? <span className="badge bg-success">Checked In</span> : <span className="badge bg-secondary">Not Checked In</span>}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(person)}
                        disabled={checkedIn}
                        title={checkedIn ? 'Cannot delete while signed in' : ''}
                      >
                        DELETE
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default DeletePersonModal;
