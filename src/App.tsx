import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Button, Row, Col, Navbar } from 'react-bootstrap';
import { Person } from './types/Person';
import AddPersonModal from './components/AddPersonModal';
import SearchBar from './components/SearchBar';
import PersonList from './components/PersonList';

const STORAGE_KEY = 'poolCheckInData';
const PEOPLE_STORAGE_KEY = 'poolPeople';

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

  const handleSignOut = (person: Person) => {
    // Remove the most recent check-in for this person (by first name and last name)
    const indexToRemove = checkedInPeople.findIndex(
      (p) => p.firstName === person.firstName && p.lastName === person.lastName
    );
    if (indexToRemove !== -1) {
      setCheckedInPeople(checkedInPeople.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleRemovePerson = (id: string) => {
    setCheckedInPeople(checkedInPeople.filter((person) => person.id !== id));
  };

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" className="mb-4">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="fw-bold">🏊 Pool Check-In</Navbar.Brand>
          <Button
            variant="light"
            onClick={() => setShowAddModal(true)}
          >
            + Add Person
          </Button>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Row>
          <Col md={8} className="mx-auto">
            <SearchBar 
              people={people} 
              checkedInPeople={checkedInPeople}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
          </Col>
        </Row>
      </Container>

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

