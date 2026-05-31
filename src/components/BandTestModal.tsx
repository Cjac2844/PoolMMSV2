import React, { useState, useCallback } from 'react';
import { Modal, Form, Button, Table, Card } from 'react-bootstrap';
import { Person, BandTest } from '../types/Person';
import '../styles/BandTestModal.css';

interface BandTestModalProps {
  show: boolean;
  onHide: () => void;
  people: Person[];
  onUpdatePerson: (person: Person) => void;
}

function BandTestModal({ show, onHide, people, onUpdatePerson }: BandTestModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [selectedPersonForBand, setSelectedPersonForBand] = useState<Person | null>(null);
  const [issuer, setIssuer] = useState('');
  const [bandType, setBandType] = useState<'Red Band' | 'Green Band'>('Red Band');
  const [issuingBand, setIssuingBand] = useState(false);

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

  const getLastTestResult = (person: Person): string => {
    if (!person.bandTests || person.bandTests.length === 0) {
      return 'Never Taken';
    }
    const lastTest = person.bandTests[person.bandTests.length - 1];
    return lastTest.bandType;
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPersonForBand(person);
    setIssuer('');
    setBandType('Red Band');
    setIssuingBand(false);
  };

  const handleIssueBand = () => {
    if (!selectedPersonForBand || !issuer.trim()) {
      alert('Please enter the issuer name');
      return;
    }

    const newBandTest: BandTest = {
      id: `${Date.now()}-${Math.random()}`,
      bandType,
      issuedBy: issuer,
      issuedAt: new Date(),
    };

    // Update person with new band test and persist to parent
    const updatedPerson = {
      ...selectedPersonForBand,
      bandTests: [...(selectedPersonForBand.bandTests || []), newBandTest],
    };

    // Call parent's update function to persist to localStorage
    onUpdatePerson(updatedPerson);
    
    // Update local state to reflect the change
    setSelectedPersonForBand(updatedPerson);
    setIssuer('');
    setBandType('Red Band');
    setIssuingBand(false);
    
    // Also update in filtered results so search results reflect new band
    setFilteredPeople(
      filteredPeople.map(p => p.id === updatedPerson.id ? updatedPerson : p)
    );
  };

  const handleClose = () => {
    setSearchTerm('');
    setFilteredPeople([]);
    setSelectedPersonForBand(null);
    setIssuer('');
    setBandType('Red Band');
    setIssuingBand(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Band Tests</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedPersonForBand ? (
          <>
            <h5 className="mb-3">Band Tests - Search</h5>
            <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-4">
              <Form.Group className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search by Last Name of Member or Guest"
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
                    <th>LAST TEST RESULT</th>
                    <th>VIEW/ISSUE BAND</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((person) => (
                    <tr key={person.id}>
                      <td>{person.firstName}</td>
                      <td>{person.lastName}</td>
                      <td>{person.personType ?? 'Swim Club Membership'}</td>
                      <td>{getLastTestResult(person)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSelectPerson(person)}
                        >
                          DETAILS
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        ) : (
          <>
            <h5 className="mb-3">Band Tests for {selectedPersonForBand.firstName} {selectedPersonForBand.lastName}</h5>
            
            <Button
              variant="dark"
              className="mb-4 w-100"
              onClick={() => setIssuingBand(!issuingBand)}
            >
              ISSUE A NEW BAND
            </Button>

            {issuingBand && (
              <Card className="mb-4 border-primary">
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Issuer Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter lifeguard name"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Band Selection</Form.Label>
                    <Form.Select
                      value={bandType}
                      onChange={(e) => setBandType(e.target.value as 'Red Band' | 'Green Band')}
                    >
                      <option value="Red Band">Red Band</option>
                      <option value="Green Band">Green Band</option>
                    </Form.Select>
                  </Form.Group>
                  <Button variant="success" className="w-100" onClick={handleIssueBand}>
                    Issue Band
                  </Button>
                </Card.Body>
              </Card>
            )}

            {selectedPersonForBand.bandTests && selectedPersonForBand.bandTests.length > 0 ? (
              <Table responsive className="mb-4">
                <thead>
                  <tr>
                    <th>BAND TYPE</th>
                    <th>ISSUED BY</th>
                    <th>ISSUED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPersonForBand.bandTests.map((test) => (
                    <tr key={test.id}>
                      <td>
                        <span className={`badge ${test.bandType === 'Red Band' ? 'bg-danger' : 'bg-success'}`}>
                          {test.bandType}
                        </span>
                      </td>
                      <td>{test.issuedBy}</td>
                      <td>{new Date(test.issuedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Card className="mb-4">
                <Card.Body className="text-center text-muted">
                  No band tests issued yet
                </Card.Body>
              </Card>
            )}

            <Button variant="secondary" className="w-100" onClick={() => setSelectedPersonForBand(null)}>
              BACK
            </Button>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default BandTestModal;