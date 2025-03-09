import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Users from './Users';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/AdminMenu', () => () => <div>AdminMenu</div>);
jest.mock('react-hot-toast');

const users = [
  {
    _id: "1", 
    name: "user1",
    email: "user1@testing.com",
    phone: "123423453456",
    address: "bukitpanjang"
  },
  {
    _id: "2", 
    name: "user2",
    email: "user2@testing.com",
    phone: "12342345324e5",
    address: "bukitbatok"
  },
  {
    _id: "3", 
    name: "user3",
    email: "user3@testing.com",
    phone: "1232345345324e5",
    address: "bukittimah"
  }
];

describe('Users Component', () => {
  test('Renders Users component and checks if all users are listed', async () => {
    axios.get.mockResolvedValue({
      data: {
        users: users
      }
    });

    render(
      <MemoryRouter initialEntries={[`/dashboard/admin/users`]}>
        <Routes>
          <Route path="/dashboard/admin/users" element={<Users />} />
        </Routes>
      </MemoryRouter>
    );

    users.forEach(async (user) => {
      await waitFor(() => {
        expect(screen.getByText(user.name)).toBeInTheDocument();
        expect(screen.getByText(user.email)).toBeInTheDocument();
        expect(screen.getByText(user.phone)).toBeInTheDocument();
        expect(screen.getByText(user.address)).toBeInTheDocument();
      });
    });
  });

  test('Displays error toast when API call fails', async () => {
    const errorMessage = "Something Went Wrong";
    axios.get.mockRejectedValue(new Error('API call failed'));

    render(
      <MemoryRouter initialEntries={[`/dashboard/admin/users`]}>
        <Routes>
          <Route path="/dashboard/admin/users" element={<Users />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
