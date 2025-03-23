import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Users from '../pages/admin/Users';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import dotenv from 'dotenv';
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { EJSON } from 'bson';
import { AuthProvider } from '../context/auth';
import { SearchProvider } from '../context/search';
import { CartProvider } from '../context/cart';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const loginState = {
  success: true,
  message: "login successfully",
  user: {
    _id: "67d409012b398f2f72b42b03",
    name: "Playwright Admin Account",
    email: "cs4218admin@test.com",
    phone: "81234567",
    address: "1 Computing Drive",
    role: 1,
  },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2Q0MDkwMTJiMzk4ZjJmNzJiNDJiMDMiLCJpYXQiOjE3NDIzOTM3MDIsImV4cCI6MTc0Mjk5ODUwMn0.puK4-yaa7AePBtniVaXHZLa3sjb2e-lj0GjGNbXzJ4A",
};

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

const parentDir = path.join(__dirname, '../../..');

const fileContent = fs.readFileSync(path.join(parentDir, './reset-mongodb/sample-data/test.users.json'), 'utf8');
const users = EJSON.parse(fileContent);

describe('Users Component', () => {
  test('Renders Users component and checks if all users are listed', async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/admin/users`]}>
              <Routes>
                <Route path="/dashboard/admin/users" element={<Users />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
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

  test('Displays error when API call fails', async () => {
    const errorMessage = "Something Went Wrong";
    axios.defaults.headers.common["Authorization"] = null;

    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/dashboard/admin/users`]}>
              <Routes>
                <Route path="/dashboard/admin/users" element={<Users />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(async () => {
      const errors = screen.getAllByText('Something Went Wrong');
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
