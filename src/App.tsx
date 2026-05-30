import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Button, Row, Col, Navbar, Card, Alert } from 'react-bootstrap';
import { Person } from './types/Person';
import AddPersonModal from './components/AddPersonModal';
import SearchBar from './components/SearchBar';
import PersonList from './components/PersonList';

const STORAGE_KEY = 'poolCheckInData';
const PEOPLE_STORAGE_KEY = 'poolPeople';
const TOAST_DURATION_MS = 2200;

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [checkedInPeople, setCheckedInPeople] = useState<Person[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchTermFromPanel, setSearchTermFromPanel] = useState('');

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
      personType: 'Swim Club Membership',
      familyName: lastName,
    };
    setPeople((previousPeople) => [...previousPeople, newPerson]);
  };

  const handleSignIn = (person: Person) => {
    const signedInPerson: Person = {
      ...person,
      checkedInTime: new Date(),
    };
    setCheckedInPeople((previousPeople) => {
      if (previousPeople.some((checkedInPerson) => checkedInPerson.id === person.id)) {
        return previousPeople;
      }
      return [signedInPerson, ...previousPeople];
    });
    setToastMessage(`${person.firstName} ${person.lastName} signed in!`);
    setShowToast(true);
  };

  const handleSignOut = (person: Person) => {
    setCheckedInPeople((previousPeople) =>
      previousPeople.filter((checkedInPerson) => checkedInPerson.id !== person.id)
    );
    setToastMessage(`${person.firstName} ${person.lastName} signed out!`);
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) {
      return undefined;
    }
    const timer = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showToast, toastMessage]);

  const selectedFamilyName = selectedPerson?.familyName ?? selectedPerson?.lastName;
  const selectedFamily = selectedPerson
    ? people.filter((person) => (person.familyName ?? person.lastName) === selectedFamilyName)
    : [];

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" className="mb-4">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="fw-bold">PoolMMS</Navbar.Brand>
          <Button
            variant="light"
            onClick={() => setShowAddModal(true)}
          >
            + Add Person
          </Button>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Row className="g-3 align-items-start">
          <Col lg={8}>
            <SearchBar 
              people={people} 
              checkedInPeople={checkedInPeople}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              onSelectPerson={setSelectedPerson}
              externalSearchTerm={searchTermFromPanel}
            />
            <PersonList
              people={checkedInPeople}
              onSignOut={handleSignOut}
              onSelectPerson={setSelectedPerson}
            />
          </Col>
          <Col lg={4}>
            {selectedPerson && (
              <Card className="detail-panel">
                <Card.Body>
                  <h5 className="mb-3">{selectedPerson.firstName} {selectedPerson.lastName}</h5>
                  <div className="detail-grid">
                    <div><strong>Age:</strong> {selectedPerson.age ?? '--'}</div>
                    <div><strong>Family Name:</strong> {selectedPerson.familyName ?? selectedPerson.lastName}</div>
                    <div><strong>Member Type:</strong> {selectedPerson.personType ?? 'Swim Club Membership'}</div>
                    <div><strong>Last Visit:</strong> {selectedPerson.lastVisit ? new Date(selectedPerson.lastVisit).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <Card className="mt-3">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>Notes</span>
                      <Button size="sm" variant="outline-secondary">Edit</Button>
                    </Card.Header>
                    <Card.Body>{selectedPerson.notes ?? 'No notes yet.'}</Card.Body>
                  </Card>
                  <Button className="w-100 mt-3" variant="outline-primary">Take A Photo</Button>
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="secondary" className="flex-fill" onClick={() => setSelectedPerson(null)}>BACK</Button>
                    <Button
                      variant="primary"
                      className="flex-fill"
                      onClick={() =>
                        setSearchTermFromPanel(selectedPerson.familyName ?? selectedPerson.lastName)
                      }
                    >
                      SEARCH FOR FAMILY
                    </Button>
                  </div>
                  <Card className="mt-3">
                    <Card.Header>Family Information</Card.Header>
                    <Card.Body>
                      {selectedFamily.map((person) => (
                        <div key={person.id}>{person.firstName} {person.lastName}</div>
                      ))}
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {showToast && (
        <Alert className="sign-toast mb-0">
          {toastMessage}
        </Alert>
      )}

      <AddPersonModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}

export default App;
