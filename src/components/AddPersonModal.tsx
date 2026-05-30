import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AddPersonModalProps {
  show: boolean;
  onHide: () => void;
  onAddPerson: (firstName: string, lastName: string) => void;
}

function AddPersonModal({ show, onHide, onAddPerson }: AddPersonModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleAdd = () => {
    if (firstName.trim() && lastName.trim()) {
      onAddPerson(firstName, lastName);
      setFirstName('');
      setLastName('');
      onHide();
    }
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Person to Pool</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={!firstName.trim() || !lastName.trim()}
        >
          Add Person
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddPersonModal;