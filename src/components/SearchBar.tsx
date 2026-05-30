import React, { useState, useMemo } from 'react';
import { Container, Form, Spinner, Alert, Button, Row, Col } from 'react-bootstrap';
import { Person } from '../types/Person';
import '../styles/SearchBar.css';

interface SearchBarProps {
  people: Person[];
  checkedInPeople: Person[];
  onSignIn: (person: Person) => void;
  onSignOut: (person: Person) => void;
}

function SearchBar({ people, checkedInPeople, onSignIn, onSignOut }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [signedInIds, setSignedInIds] = useState<Set<string>>(new Set());

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setIsLoading(true);
      // Simulate loading animation
      setTimeout(() => {
        const results = people.filter((person) =>
          person.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPeople(results);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSignIn = (person: Person) => {
    onSignIn(person);
    setSuccessMessage(`${person.firstName} ${person.lastName} signed in!`);
    setShowSuccessMessage(true);
    // Add this person's ID to the signed-in set without using spread on Set
    const newSignedIn = new Set(signedInIds);
    newSignedIn.add(person.id);
    setSignedInIds(newSignedIn);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const handleSignOut = (person: Person) => {
    onSignOut(person);
    setSuccessMessage(`${person.firstName} ${person.lastName} signed out!`);
    setShowSuccessMessage(true);
    // Remove this person's ID from the signed-in set
    const newSignedInIds = new Set(signedInIds);
    newSignedInIds.delete(person.id);
    setSignedInIds(newSignedInIds);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const isPersonSignedIn = (personId: string) => signedInIds.has(personId);

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Form.Group>
            <Form.Label className="fw-bold fs-5">Search by Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter last name and press Enter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              disabled={isLoading}
              size="lg"
            />
          </Form.Group>
        </Col>
      </Row>

      {isLoading && (
        <Row className="mb-4">
          <Col md={8} className="mx-auto text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      )}

      {showSuccessMessage && (
        <Row className="mb-4">
          <Col md={8} className="mx-auto">
            <Alert variant="success" className="fade-out-alert mb-0">
              ✓ {successMessage}
            </Alert>
          </Col>
        </Row>
      )}

      {!isLoading && filteredPeople.length > 0 && (
        <Row>
          <Col md={8} className="mx-auto">
            <div className="search-results">
              {filteredPeople.map((person) => {
                const isSignedIn = isPersonSignedIn(person.id);
                return (
                  <div key={person.id} className="search-result-row">
                    <span className="person-name">
                      {person.firstName} {person.lastName}
                    </span>
                    <Button
                      variant={isSignedIn ? 'danger' : 'success'}
                      onClick={() => isSignedIn ? handleSignOut(person) : handleSignIn(person)}
                      className="sign-in-btn"
                    >
                      {isSignedIn ? 'Sign Out' : 'Sign In'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      )}

      {/* !isLoading && searchTerm.trim() && filteredPeople.length === 0 && (
         <Row>
           <Col md={8} className="mx-auto">
             <Alert variant="warning" className="mb-0">
               No people found with last name "{searchTerm}". Try adding them first!
             </Alert>
           </Col>
         </Row>
       )*/}
    </Container>
  );
}

export default SearchBar;