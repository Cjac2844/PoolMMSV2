import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders front desk home page header and search input', () => {
  render(<App />);
  expect(screen.getByText(/haddon glen swim club \/ front desk/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/scan a card or enter a last name/i)).toBeInTheDocument();
  expect(screen.getByText(/current attendance: 0/i)).toBeInTheDocument();
});

test('keeps search results open and toggles sign in to sign out', async () => {
  localStorage.setItem('poolPeople', JSON.stringify([
    { id: '1', firstName: 'Connor', lastName: 'Jackson', checkedInTime: new Date() },
    { id: '2', firstName: 'Kaelynn', lastName: 'Jackson', checkedInTime: new Date() },
  ]));

  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(/scan a card or enter a last name/i), {
    target: { value: 'jackson' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'GO' }));

  expect(screen.getByText('Connor')).toBeInTheDocument();
  expect(screen.getByText('Kaelynn')).toBeInTheDocument();

  const signInButtons = screen.getAllByRole('button', { name: 'SIGN IN' });
  fireEvent.click(signInButtons[0]);

  expect(await screen.findByText(/signed in!/i)).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'SIGN OUT' }).length).toBeGreaterThan(0);
  expect(screen.getByText(/checked-in members/i)).toBeInTheDocument();
  expect(screen.getByText('Kaelynn')).toBeInTheDocument();
});
