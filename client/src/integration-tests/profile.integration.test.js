import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from '../pages/user/Profile';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import dotenv from 'dotenv';
import { execSync } from "child_process";
import path from "path";
import { SearchProvider } from '../context/search';
import { CartProvider } from '../context/cart';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const user = {
  _id: "67a218decf4efddf1e5358ac",
  name: "Playwright User Account",
  email: "cs4218@test.com",
  phone: "81234567",
  address: "1 Computing Drive",
  role: 0,
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2EyMThkZWNmNGVmZGRmMWU1MzU4YWMiLCJpYXQiOjE3NDI2MzMxMTIsImV4cCI6MTc0MzIzNzkxMn0._9Fone7nRwqnZeqmqQJk41GA1_2qoyvTksZ1wSdWPl4"

const loginState = {
  success: true,
  message: "login successfully",
  user: user,
  token: token
};

jest.mock('../context/auth', () => ({
  useAuth: jest.fn(() => [{
    user: user,
    token: token
  }, jest.fn()]),
}));

beforeAll(async () => {
  window.localStorage.setItem("auth", JSON.stringify(loginState));
  axios.defaults.baseURL = "http://localhost:6060";
  axios.defaults.headers.common["Authorization"] = loginState.token;
});

afterAll(async () => {
  window.localStorage.removeItem("auth");
  axios.defaults.baseURL = undefined;
});

beforeEach(() => {
  execSync("npm run db:reset", { stdio: "inherit" });
});

describe('Profile', () => {
  test('Should correctly renders profile form with user data', async () => {
    render(
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
              <Routes>
                <Route path="/dashboard/user/profile" element={<Profile />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Your Name/)).toHaveValue(user.name);
      expect(screen.getByPlaceholderText(/Enter Your Email/)).toHaveValue(user.email);
      expect(screen.getByPlaceholderText(/Enter Your Phone/)).toHaveValue(user.phone);
      expect(screen.getByPlaceholderText(/Enter Your Password/)).toHaveValue("");
      expect(screen.getByPlaceholderText(/Enter Your Address/)).toHaveValue(user.address);
    });
  });

  test('Should update user successfully', async () => {
    const expectedUser = {
      name: 'newName',
      phone: '0987654321',
      address: 'changi'
    }

    await act(async () => {
      render(    
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
                <Routes>
                  <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
              </MemoryRouter>
            </CartProvider>
          </SearchProvider>
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: expectedUser.name } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: expectedUser.phone } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: expectedUser.address } });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Your Name/)).toHaveValue(expectedUser.name);
      expect(screen.getByPlaceholderText(/Enter Your Phone/)).toHaveValue(expectedUser.phone);
      expect(screen.getByPlaceholderText(/Enter Your Address/)).toHaveValue(expectedUser.address);
    });
  });

  test('Displays error when API call fails', async () => {
    const errorMessage = "Something went wrong";
    axios.defaults.headers.common["Authorization"] = null;

    const expectedUser = {
      name: 'newName',
      phone: '0987654321',
      address: 'changi'
    }

    await act(async () => {
      render(    
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={[`/dashboard/user/profile`]}>
                <Routes>
                  <Route path="/dashboard/user/profile" element={<Profile />} />
                </Routes>
              </MemoryRouter>
            </CartProvider>
          </SearchProvider>
      );
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), { target: { value: expectedUser.name } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), { target: { value: expectedUser.phone } });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), { target: { value: expectedUser.address } });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(async () => {
      const errors = screen.getAllByText(errorMessage);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
