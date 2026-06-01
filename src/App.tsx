import React, { useState, useEffect } from 'react';
import './App.css';
import { Container, Button, Row, Col, Navbar, Card, Alert, Modal } from 'react-bootstrap';
import { Person, GuestPass } from './types/Person';
import AddPersonModal from './components/AddPersonModal';
import SearchBar from './components/SearchBar';
import PersonList from './components/PersonList';
import BandTestModal from './components/BandTestModal';
import DeletePersonModal from './components/DeletePersonModal';
import SignInGuestModal from './components/SignInGuestModal';

const STORAGE_KEY = 'poolCheckInData';
const MEMBERS_STORAGE_KEY = 'poolMembers';
const GUEST_PASSES_STORAGE_KEY = 'poolGuestPasses';
const TOAST_DURATION_MS = 2200;

function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [checkedInPeople, setCheckedInPeople] = useState<Person[]>([]);
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBandTestModal, setShowBandTestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showSignOutAllWarning, setShowSignOutAllWarning] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  // Load data from localStorage and JSON on mount
  useEffect(() => {
    // Load members from JSON file
    const loadMembers = async () => {
      try {
        const response = await fetch('/members.json');
        const data = await response.json();
        
        // Check for cached member updates (notes, band tests)
        const cachedMembers = localStorage.getItem(MEMBERS_STORAGE_KEY);
        let memberUpdates: { [key: string]: any } = {};
        
        if (cachedMembers) {
          try {
            memberUpdates = JSON.parse(cachedMembers);
          } catch (e) {
            console.error('Error parsing cached members:', e);
          }
        }
        
        const loadedMembers = data.members.map((person: any) => ({
          ...person,
          checkedInTime: new Date(),
          bandTests: memberUpdates[person.id]?.bandTests || [],
          notes: memberUpdates[person.id]?.notes || person.notes || '',
        }));
        
        setPeople(loadedMembers);
      } catch (error) {
        console.error('Error loading members from JSON:', error);
      }
    };

    loadMembers();

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

    const savedGuestPasses = localStorage.getItem(GUEST_PASSES_STORAGE_KEY);
    if (savedGuestPasses) {
      try {
        const parsedPasses = JSON.parse(savedGuestPasses);
        setGuestPasses(parsedPasses);
      } catch (error) {
        console.error('Error loading guest passes:', error);
      }
    }
  }, []);

  // Save checked-in data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedInPeople));
  }, [checkedInPeople]);

  // Save guest passes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(GUEST_PASSES_STORAGE_KEY, JSON.stringify(guestPasses));
  }, [guestPasses]);

  // Save member updates (notes, band tests) to localStorage
  useEffect(() => {
    const memberUpdates: { [key: string]: any } = {};
    people.forEach(person => {
      if (!person.isGuest) {
        memberUpdates[person.id] = {
          notes: person.notes || '',
          bandTests: person.bandTests || [],
        };
      }
    });
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(memberUpdates));
  }, [people]);

  const handleAddPerson = (firstName: string, lastName: string, age: number | undefined, personType: string) => {
    const newPerson: Person = {
      id: `guest-${Date.now()}-${Math.random()}`,
      firstName,
      lastName,
      checkedInTime: new Date(),
      personType,
      age,
      familyName: lastName,
      bandTests: [],
      isGuest: true,
    };
    setPeople((previousPeople) => [...previousPeople, newPerson]);
  };

  const handleDeletePerson = (personId: string) => {
    setPeople((previousPeople) => previousPeople.filter(p => p.id !== personId));
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

  const handleSignInGuest = (guest: Person, sponsoringMemberId: string, usedPass: boolean) => {
    const guestWithMemberId = {
      ...guest,
      sponsoringMemberId,
    };
    
    // Add guest to people list
    setPeople((previousPeople) => [...previousPeople, guestWithMemberId]);
    
    // Sign guest in
    handleSignIn(guestWithMemberId);
    
    setToastMessage(`${guest.firstName} ${guest.lastName} signed in as guest!`);
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

  const handleSaveNotes = () => {
    if (selectedPerson) {
      handleUpdatePerson({
        ...selectedPerson,
        notes: editedNotes || '',
      });
      setIsEditingNotes(false);
      setToastMessage('Notes saved!');
      setShowToast(true);
    }
  };

  const handleResetGuestPasses = () => {
    if (selectedPerson) {
      const familyName = selectedPerson.familyName ?? selectedPerson.lastName;
      const updatedPasses = guestPasses.map((p) =>
        p.familyName === familyName
          ? { ...p, passesRemaining: 4 }
          : p
      );
      // If family doesn't exist, create it
      if (!updatedPasses.find(p => p.familyName === familyName)) {
        updatedPasses.push({ familyName, passesRemaining: 4 });
      }
      setGuestPasses(updatedPasses);
      setToastMessage('Guest passes reset to 4!');
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (!showToast) {
      return undefined;
    }
    const timer = setTimeout(() => setShowToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showToast, toastMessage]);

  const getGuestPassesRemaining = (familyName: string): number => {
    const passes = guestPasses.find(p => p.familyName === familyName);
    return passes ? passes.passesRemaining : 4;
  };

  const selectedFamilyName = selectedPerson?.familyName ?? selectedPerson?.lastName;
  const selectedFamily = selectedPerson
    ? people.filter((person) => (person.familyName ?? person.lastName) === selectedFamilyName && !person.isGuest)
    : [];

  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" className="mb-4">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="fw-bold">Haddon Glen Swim Club</Navbar.Brand>
          <div className="d-flex gap-2">
            <Button
              variant="warning"
              onClick={() => setShowBandTestModal(true)}
            >
              Band Test
            </Button>
            <Button
              variant="info"
              onClick={() => setShowGuestModal(true)}
            >
              Sign In Guest
            </Button>
            <Button
              variant="light"
              onClick={() => setShowAddModal(true)}
            >
              + Add Temp Person
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
                    {!selectedPerson.isGuest && (
                      <div><strong>Guest Passes Remaining:</strong> {getGuestPassesRemaining(selectedPerson.familyName ?? selectedPerson.lastName)}</div>
                    )}
                  </div>
                  <Card className="mt-3">
                    <Card.Header>Notes</Card.Header>
                    <Card.Body>
                      {!isEditingNotes ? (
                        <>
                          <p className="text-muted">{selectedPerson.notes || 'No notes provided.'}</p>
                          <Button variant="primary" size="sm" onClick={() => {
                            setIsEditingNotes(true);
                            setEditedNotes(selectedPerson.notes || '');
                          }}>
                            EDIT
                          </Button>
                        </>
                      ) : (
                        <>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Add notes here..."
                          />
                          <div className="d-flex gap-2 mt-2">
                            <Button variant="success" size="sm" onClick={handleSaveNotes}>
                              SAVE
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setIsEditingNotes(false)}>
                              CANCEL
                            </Button>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="secondary" className="flex-fill" onClick={() => setSelectedPerson(null)}>BACK</Button>
                  </div>
                  {!selectedPerson.isGuest && (
                    <Button variant="warning" className="w-100 mt-3" onClick={handleResetGuestPasses}>
                      Reset Guest Passes
                    </Button>
                  )}
                  <Card className="mt-3">
                    <Card.Header>Family Information</Card.Header>
                    <Card.Body>
                      {selectedFamily.length > 0 ? (
                        selectedFamily.map((person) => (
                          <div key={person.id}>{person.firstName} {person.lastName}</div>
                        ))
                      ) : (
                        <p className="text-muted">No family members.</p>
                      )}
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

      <BandTestModal
        show={showBandTestModal}
        onHide={() => setShowBandTestModal(false)}
        people={people}
        onUpdatePerson={handleUpdatePerson}
      />

      <DeletePersonModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        people={people}
        checkedInPeople={checkedInPeople}
        onDeletePerson={handleDeletePerson}
      />

      <SignInGuestModal
        show={showGuestModal}
        onHide={() => setShowGuestModal(false)}
        people={people}
        guestPasses={guestPasses}
        onSignInGuest={handleSignInGuest}
        onUpdateGuestPasses={setGuestPasses}
      />

      <AddPersonModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}

export default App;

