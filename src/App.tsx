import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Button, Row, Col, Navbar } from 'react-bootstrap';
import { Person } from './types/Person';
import AddPersonModal from './components/AddPersonModal';
import PersonList from './components/PersonList';

const STORAGE_KEY = 'poolCheckInData';
const PEOPLE_STORAGE_KEY = 'poolPeople';

function SearchBar({ people, onSignIn }: { people: Person[]; onSignIn: (person: Person) => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPeople = people.filter((person) => {
    const query = searchTerm.toLowerCase().trim();
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    return query === '' || fullName.includes(query);
  });

  return (
    <Container className="py-3">
      <Row>
        <Col md={8} className="mx-auto">
          <input
            type="search"
            className="form-control"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="mt-3">
            {filteredPeople.map((person) => (
              <Button
                key={person.id}
                variant="outline-primary"
                className="me-2 mb-2"
                onClick={() => onSignIn(person)}
              >
                Sign in {person.firstName} {person.lastName}
              </Button>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [checkedInPeople, setCheckedInPeople] = useState<Person[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPeople = localStorage.getItem(PEOPLE_STORAGE_KEY);
    if (savedPeople) {
      try {
        const parsedData = JSON.parse(savedPeople);
        setPeople(parsedData);
      } catch (error) {
        console.error('Error loading people data:', error);
      }
    }

    const savedCheckedIn = localStorage.getItem(STORAGE_KEY);
    if (savedCheckedIn) {
      try {
        const parsedData = JSON.parse(savedCheckedIn);
        setCheckedInPeople(
          parsedData.map((person: any) => ({
            ...person,
            checkedInTime: new Date(person.checkedInTime),
          }))
        );
      } catch (error) {
        console.error('Error loading checked-in data:', error);
      }
    }
  }, []);

  // Save people data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
  }, [people]);

  // Save checked-in data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedInPeople));
  }, [checkedInPeople]);

  const handleAddPerson = (firstName: string, lastName: string) => {
    const newPerson: Person = {
      id: `${Date.now()}-${Math.random()}`,
      firstName,
      lastName,
      checkedInTime: new Date(),
    };
    setPeople([...people, newPerson]);
  };

  const handleSignIn = (person: Person) => {
    const signedInPerson: Person = {
      ...person,
      id: `checked-${Date.now()}-${Math.random()}`,
      checkedInTime: new Date(),
    };
    setCheckedInPeople([signedInPerson, ...checkedInPeople]);
  };

  const handleRemovePerson = (id: string) => {
    setCheckedInPeople(checkedInPeople.filter((person) => person.id !== id));
  };

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand className="fw-bold">🏊 Pool Check-In</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Row className="mb-4">
          <Col md={6} className="mx-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-100"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Person
            </Button>
          </Col>
        </Row>
      </Container>

      <SearchBar people={people} onSignIn={handleSignIn} />

      <Container className="py-4">
        <Row>
          <Col md={8} className="mx-auto">
            <PersonList people={checkedInPeople} onRemovePerson={handleRemovePerson} />
          </Col>
        </Row>
      </Container>

      <AddPersonModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}

export default App;

