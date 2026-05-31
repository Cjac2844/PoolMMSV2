import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Button, Row, Col, Navbar, Card, Alert, Modal } from 'react-bootstrap';
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
  const [showSignOutAllWarning, setShowSignOutAllWarning] = useState(false);

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
            lastVisit: person.lastVisit ? new Date(person.lastVisit) : undefined,
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

  const handleAddPerson = (firstName: string, lastName: string, age: number | undefined, personType: string) => {
    const newPerson: Person = {
      id: `${Date.now()}-${Math.random()}`,
      firstName,
      lastName,
      checkedInTime: new Date(),
      personType,
      age,
      familyName: lastName,
    };
    setPeople((previousPeople) => [...previousPeople, newPerson]);
  };

  const handleSignIn = (person: Person) => {
    const signedInPerson: Person = {
      ...person,
      checkedInTime: new Date(),
      lastVisit: new Date(),
    };
    setCheckedInPeople((previousPeople) => {
      if (previousPeople.some((checkedInPerson) => checkedInPerson.id === person.id)) {
        return previousPeople;
      }
      return [signedInPerson, ...previousPeople];
    });
    
    // Also update the person in the people list with the new lastVisit
    setPeople((previousPeople) =>
      previousPeople.map((p) =>
        p.id === person.id ? { ...p, lastVisit: new Date() } : p
      )
    );
    
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

  const handleSignOutAll = () => {
    setCheckedInPeople([]);
    setShowSignOutAllWarning(false);
    setToastMessage('All guests signed out!');
    setShowToast(true);
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    // Update in people array
    setPeople((previousPeople) =>
      previousPeople.map((person) =>
        person.id === updatedPerson.id ? updatedPerson : person
      )
    );
    // Update selected person
    setSelectedPerson(updatedPerson);
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
          <Navbar.Brand className="fw-bold">Haddon Glen Swim Club</Navbar.Brand>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={() => setShowAddModal(true)}
            >
              + Add Person
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowSignOutAllWarning(true)}
              disabled={checkedInPeople.length === 0}
            >
              Sign Out All
            </Button>
          </div>
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
                    <Card.Header>Notes</Card.Header>
                    <Card.Body>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={selectedPerson.notes ?? ''}
                        onChange={(e) =>
                          handleUpdatePerson({
                            ...selectedPerson,
                            notes: e.target.value || undefined,
                          })
                        }
                        placeholder="Add notes here..."
                      />
                      <small className="text-muted d-block mt-2">Changes save automatically</small>
                    </Card.Body>
                  </Card>
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="secondary" className="w-100" onClick={() => setSelectedPerson(null)}>BACK</Button>
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

      <Modal show={showSignOutAllWarning} onHide={() => setShowSignOutAllWarning(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Sign Out All</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will sign out <strong>everyone</strong> who is currently checked in. Are you sure you want to do this?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignOutAllWarning(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSignOutAll}>
            Sign Everyone Out
          </Button>
        </Modal.Footer>
      </Modal>

      <AddPersonModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}

export default App;

