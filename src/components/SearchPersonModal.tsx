import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Person } from '../types/Person';
import '../styles/SearchPersonModal.css';

interface SearchPersonModalProps {
  show: boolean;
  onHide: () => void;
  people: Person[];
  onSignIn: (person: Person) => void;
}

function SearchPersonModal({ show, onHide, people, onSignIn }: SearchPersonModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const filteredPeople = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return people.filter((person) =>
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, people]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setIsLoading(true);
      // Simulate loading animation
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleSignIn = () => {
    if (selectedPerson) {
      onSignIn(selectedPerson);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSearchTerm('');
        setSelectedPerson(null);
        onHide();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedPerson(null);
    setIsLoading(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Search & Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showSuccessMessage && selectedPerson && (
          <Alert variant="success" className="mb-3">
            ✓ {selectedPerson.firstName} {selectedPerson.lastName} signed in!
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Search by Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter last name to search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
        </Form.Group>

        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!isLoading && searchTerm.trim() && (
          <div>
            {filteredPeople.length > 0 ? (
              <>
                <ListGroup>
                  {filteredPeople.map((person) => (
                    <ListGroup.Item
                      key={person.id}
                      active={selectedPerson?.id === person.id}
                      onClick={() => handleSelectPerson(person)}
                      className="person-list-item"
                    >
                      <div>
                        <span>
                          {person.firstName} {person.lastName}
                        </span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                {selectedPerson && (
                  <Button
                    variant="success"
                    className="w-100 mt-3"
                    onClick={handleSignIn}
                  >
                    Sign In
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted">No people found with that last name.</p>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchPersonModal;