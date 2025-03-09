import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Profile from './Profile';
import { useAuth } from '../../context/auth';
import toast from 'react-hot-toast';
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach } from 'node:test';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [{}, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [{}, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory")

describe('Profile page test', () => {
  const user = {
    name: "user123",
    email: "user@testing.com",
    phone: "123423453456",
    address: "bukitpanjang"
  }; 

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test('Should correctly renders profile form with user data', async () => {
    useAuth.mockReturnValue([{ user: user }, () => {}]);

    render(    
    <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
      <Routes>
        <Route path="/dashboard/user/profile" element={<Profile />} />
      </Routes>
    </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Your Name/)).toHaveValue("user123");
      expect(screen.getByPlaceholderText(/Enter Your Email/)).toHaveValue("user@testing.com");
      expect(screen.getByPlaceholderText(/Enter Your Phone/)).toHaveValue("123423453456");
      expect(screen.getByPlaceholderText(/Enter Your Password/)).toHaveValue("");
      expect(screen.getByPlaceholderText(/Enter Your Address/)).toHaveValue("bukitpanjang");
    });
  });

  test('Should call API with the right data', async () => {
    render(    
      <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: 'newName' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: 'newPassword' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: 'changi' } });

    fireEvent.click(screen.getByText('UPDATE'));

    expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
      name: 'newName',
      email: 'user@testing.com',
      password: 'newPassword',
      phone: '0987654321',
      address: 'changi',
    });
  });

  test('Show successful message if update successfully', async () => {
    useAuth.mockReturnValue([{user: user}, () => {}]);
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ user: user }));
    Storage.prototype.setItem = jest.fn();
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'newName',
          email: 'user@testing.com',
          phone: '0987654321',
          address: 'changi',
        },
      },
    });

    render(    
      <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: 'newName' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: 'newPassword' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: 'changi' } });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  test('Should update localStorage with correct data', async () => {
    useAuth.mockReturnValue([{user: user}, () => {}]);
    Storage.prototype.getItem = jest.fn(() => JSON.stringify({ user: user }));
    Storage.prototype.setItem = jest.fn();
    
    const updatedUser = {
      name: 'newName',
      email: 'newEmail@example.com',
      phone: '0987654321',
      address: 'changi',
    }

    axios.put.mockResolvedValue({
      data: {
        updatedUser 
      }
    });

    render(    
      <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: 'newName' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), { target: { value: 'newPassword' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: 'changi' } });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => expect(localStorage.setItem).toHaveBeenCalledWith('auth', JSON.stringify({ user: updatedUser })));
  });

  test('Shows error message on profile update failure', async () => {
    axios.put.mockRejectedValue(new Error('Update failed'));

    render(    
      <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
        <Routes>
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});