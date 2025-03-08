import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import PrivateRoute from './Private';
import { useAuth } from '../../context/auth';
import { beforeEach } from 'node:test';

jest.mock('axios');
jest.mock('../../context/auth');
jest.mock('../Spinner', () => () => <div>Mock Spinner</div>);

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  });

  test('Renders Spinner when not authenticated', async () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );
    
    await waitFor(() => expect(screen.getByText('Mock Spinner')).toBeInTheDocument());
  });

  test('Does not render Spinner when authenticated', async () => {
    useAuth.mockReturnValue([{ token: 'test-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText('Mock Spinner')).not.toBeInTheDocument());
  });

  test('Renders Spinner when authentication fails', async () => {
    useAuth.mockReturnValue([{ token: 'test-token' }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Mock Spinner')).toBeInTheDocument());
  });
});