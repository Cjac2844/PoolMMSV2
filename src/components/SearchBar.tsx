import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, Button, InputGroup, Table } from 'react-bootstrap';
import { Person } from '../types/Person';
import '../styles/SearchBar.css';

interface SearchBarProps {
  people: Person[];
  checkedInPeople: Person[];
  onSignIn: (person: Person) => void;
  onSignOut: (person: Person) => void;
  onSelectPerson: (person: Person) => void;
  externalSearchTerm?: string;
}

function SearchBar({
  people,
  checkedInPeople,
  onSignIn,
  onSignOut,
  onSelectPerson,
  externalSearchTerm = '',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const signedInIds = new Set(checkedInPeople.map((person) => person.id));

  const runSearch = useCallback((term: string) => {
    const normalizedTerm = term.trim().toLowerCase();
    setHasSearched(Boolean(normalizedTerm));
    if (!normalizedTerm) {
      setFilteredPeople([]);
      return;
    }
    const results = people.filter((person) =>
      person.lastName.toLowerCase().includes(normalizedTerm)
    );
    setFilteredPeople(results);
  }, [people]);

  useEffect(() => {
    if (!externalSearchTerm.trim()) {
      return;
    }
    setSearchTerm(externalSearchTerm);
    runSearch(externalSearchTerm);
  }, [externalSearchTerm, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  const handleSignToggle = (person: Person) => {
    if (signedInIds.has(person.id)) {
      onSignOut(person);
      return;
    }
    onSignIn(person);
  };

  const guestCount = checkedInPeople.filter((person) => person.personType === 'Guest').length;
  const memberCount = checkedInPeople.length - guestCount;

  return (
    <>
      <Card className="front-desk-card">
        <Card.Body>
          <div className="front-desk-header">
            <h2 className="front-desk-title mb-2">Haddon Glen Swim Club / Front Desk</h2>
            <div className="attendance-text">
              Current Attendance: {checkedInPeople.length} (with {memberCount} members and {guestCount} guests)
            </div>
          </div>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Enter a last name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Enter a last name"
              />
              <Button type="submit" variant="secondary">GO</Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {hasSearched && (
        <Card className="mt-3">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Family</th>
                  <th>Type</th>
                  <th>Sign In/Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map((person) => {
                  const isSignedIn = signedInIds.has(person.id);
                  return (
                    <tr key={person.id} onClick={() => onSelectPerson(person)} className="selectable-row">
                      <td>{person.firstName}</td>
                      <td>{person.lastName}</td>
                      <td>{person.familyName ?? person.lastName}</td>
                      <td>{person.personType ?? 'Swim Club Membership'}</td>
                      <td>
                        <Button
                          variant={isSignedIn ? 'danger' : 'success'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSignToggle(person);
                          }}
                        >
                          {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default SearchBar;