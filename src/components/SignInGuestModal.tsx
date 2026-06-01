import React, { useState, useCallback } from 'react';
import { Modal, Form, Button, Table, Card } from 'react-bootstrap';
import { Person, GuestPass } from '../types/Person';

interface SignInGuestModalProps {
  show: boolean;
  onHide: () => void;
  people: Person[];
  guestPasses: GuestPass[];
  onSignInGuest: (guest: Person, sponsoringMemberId: string, usedPass: boolean) => void;
  onUpdateGuestPasses: (passes: GuestPass[]) => void;
}

function SignInGuestModal({ show, onHide, people, guestPasses, onSignInGuest, onUpdateGuestPasses }: SignInGuestModalProps) {
  const [step, setStep] = useState<'details' | 'member'>('details');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestAge, setGuestAge] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Person[]>([]);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [useGuestPass, setUseGuestPass] = useState(true);

  const getGuestPassesRemaining = (familyName: string): number => {
    const passes = guestPasses.find(p => p.familyName === familyName);
    return passes ? passes.passesRemaining : 4;
  };

  const getPassesPreview = (): number => {
    if (!selectedMember) return 0;
    const familyName = selectedMember.familyName ?? selectedMember.lastName;
    const remaining = getGuestPassesRemaining(familyName);
    return useGuestPass ? Math.max(0, remaining - 1) : remaining;
  };

  const handleMemberSearch = useCallback(() => {
    const normalizedTerm = memberSearchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      setFilteredMembers([]);
      return;
    }
    const results = people.filter(
      (person) =>
        !person.isGuest &&
        person.lastName.toLowerCase().includes(normalizedTerm)
    );
    setFilteredMembers(results);
  }, [memberSearchTerm, people]);

  const handleSelectMember = (member: Person) => {
    setSelectedMember(member);
    setStep('member');
  };

  const handleSubmit = () => {
    if (!guestFirstName.trim() || !guestLastName.trim() || !selectedMember) {
      alert('Please fill in all fields');
      return;
    }

    const guestId = `${Date.now()}-${Math.random()}`;
    const newGuest: Person = {
      id: guestId,
      firstName: guestFirstName,
      lastName: guestLastName,
      age: guestAge ? parseInt(guestAge) : undefined,
      checkedInTime: new Date(),
      personType: 'Guest',
      familyName: selectedMember.familyName ?? selectedMember.lastName,
      isGuest: true,
      sponsoringMemberId: selectedMember.id,
      bandTests: [],
    };

    // Update guest passes if using a pass
    if (useGuestPass) {
      const familyName = selectedMember.familyName ?? selectedMember.lastName;
      const updatedPasses = guestPasses.map((p) =>
        p.familyName === familyName
          ? { ...p, passesRemaining: Math.max(0, p.passesRemaining - 1) }
          : p
      );
      // If family doesn't exist in guestPasses, create it
      if (!updatedPasses.find(p => p.familyName === familyName)) {
        updatedPasses.push({ familyName, passesRemaining: 3 });
      }
      onUpdateGuestPasses(updatedPasses);
    }

    onSignInGuest(newGuest, selectedMember.id, useGuestPass);
    handleClose();
  };

  const handleClose = () => {
    setStep('details');
    setGuestFirstName('');
    setGuestLastName('');
    setGuestAge('');
    setMemberSearchTerm('');
    setFilteredMembers([]);
    setSelectedMember(null);
    setUseGuestPass(true);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Sign In Guest</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {step === 'details' ? (
          <>
            <h5 className="mb-3">Guest Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter guest first name"
                value={guestFirstName}
                onChange={(e) => setGuestFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter guest last name"
                value={guestLastName}
                onChange={(e) => setGuestLastName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter age (optional)"
                value={guestAge}
                onChange={(e) => setGuestAge(e.target.value)}
                min="0"
                max="120"
              />
            </Form.Group>
            <h5 className="mb-3 mt-4">Select Sponsoring Member</h5>
            <Form onSubmit={(e) => { e.preventDefault(); handleMemberSearch(); }} className="mb-3">
              <Form.Group className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Search by member last name"
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                />
                <Button variant="primary" onClick={handleMemberSearch}>
                  Search
                </Button>
              </Form.Group>
            </Form>
            {filteredMembers.length > 0 && (
              <Table responsive hover size="sm">
                <thead>
                  <tr>
                    <th>FIRST NAME</th>
                    <th>LAST NAME</th>
                    <th>SELECT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.firstName}</td>
                      <td>{member.lastName}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleSelectMember(member)}
                        >
                          SELECT
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
            <h5 className="mb-3">Guest Pass Information</h5>
            <Card className="mb-3">
              <Card.Body>
                <p><strong>Guest:</strong> {guestFirstName} {guestLastName}</p>
                <p><strong>Sponsored by:</strong> {selectedMember?.firstName} {selectedMember?.lastName}</p>
              </Card.Body>
            </Card>

            <Form.Group className="mb-3">
              <Form.Label className="mb-2">Is the Member using a guest pass?</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Yes"
                  name="guestPass"
                  value="yes"
                  checked={useGuestPass}
                  onChange={() => setUseGuestPass(true)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="guestPass"
                  value="no"
                  checked={!useGuestPass}
                  onChange={() => setUseGuestPass(false)}
                />
              </div>
            </Form.Group>

            <Card className="mb-3 border-info">
              <Card.Body>
                <strong>Guest passes remaining: {getPassesPreview()}</strong>
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button variant="secondary" className="flex-fill" onClick={() => setStep('details')}>
                BACK
              </Button>
              <Button variant="success" className="flex-fill" onClick={handleSubmit}>
                SIGN IN GUEST
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default SignInGuestModal;
