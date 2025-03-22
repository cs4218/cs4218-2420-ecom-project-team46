import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"; // Enable matchers like toBeInTheDocument()
import axios from "axios";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import App from "../App";
import { execSync } from "child_process";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Set axios base URL for API calls to the testing server
axios.defaults.baseURL = "http://localhost:6060";

// Helper component to display current location
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

beforeAll(async () => {
  // Reset the database before tests begin
  execSync("npm run db:reset", { stdio: "inherit" });
  const mongoUri = process.env.MONGO_URL;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  axios.defaults.baseURL = undefined;
  await mongoose.disconnect();
  execSync("npm run db:reset", { stdio: "inherit" });
  cleanup();
});

beforeEach(() => {
  // Reset DB state before each test
  execSync("npm run db:reset", { stdio: "inherit" });
});

afterEach(() => {
  cleanup();
});

describe("Auth Pages Integration Tests", () => {
  // ---------------------------
  // Register Page Tests
  // ---------------------------
  describe("Register Page", () => {
    it("should allow user to register successfully", async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={["/register"]}>
                  <App />
                  <LocationDisplay />
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      });

      // Fill out the registration form with valid data
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "Test User" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "testuser@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { target: { value: "password123" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: "1234567890" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: "123 Test St" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), { target: { value: "1990-01-01" } });
        fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), { target: { value: "soccer" } });
      });

      // Submit the form
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /register/i }));
      });

      // Expect navigation to the login page (assuming login route is "/login")
      await waitFor(() => {
        expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
      });
    });

  });

  // ---------------------------
  // Login Page Tests
  // ---------------------------
  describe("Login Page", () => {
    // Pre-register a user for login tests
    beforeEach(async () => {
      await axios.post("/api/v1/auth/register", {
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        DOB: "1990-01-01",
        answer: "soccer",
      });
    });

    it("should allow user to login successfully", async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={["/login"]}>
                  <App />
                  <LocationDisplay />
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      });

      // Fill out login form with valid credentials
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "testuser@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { target: { value: "password123" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
      });

      // Expect the location to change to "/" after successful login
      await waitFor(() => {
        expect(screen.getByTestId("location-display").textContent).toBe("/");
      });
    });

    it("should show error on login with incorrect credentials", async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={["/login"]}>
                  <App />
                  <LocationDisplay />
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      });

      // Fill out login form with invalid credentials
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "testuser@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { target: { value: "wrongpassword" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });
    });
  });

  // ---------------------------
  // Forgot Password Page Tests
  // ---------------------------
  describe("Forgot Password Page", () => {
    // Pre-register a user for forgot password tests
    beforeEach(async () => {
      await axios.post("/api/v1/auth/register", {
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Test St",
        DOB: "1990-01-01",
        answer: "soccer",
      });
    });

    it("should allow user to reset password successfully", async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={["/forgot-password"]}>
                  <App />
                  <LocationDisplay />
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      });

      // Fill out forgot password form with valid data
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "testuser@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Security Answer"), { target: { value: "soccer" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), { target: { value: "newpassword456" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      });

      // Expect navigation to login page after successful password reset
      await waitFor(() => {
        expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
      });
    });

    it("should show error on forgot password with wrong security answer", async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <SearchProvider>
              <CartProvider>
                <MemoryRouter initialEntries={["/forgot-password"]}>
                  <App />
                  <LocationDisplay />
                </MemoryRouter>
              </CartProvider>
            </SearchProvider>
          </AuthProvider>
        );
      });

      // Fill out form with an incorrect security answer
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "testuser@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your Security Answer"), { target: { value: "wrongAnswer" } });
        fireEvent.change(screen.getByPlaceholderText("Enter Your New Password"), { target: { value: "newpassword456" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Wrong Email Or Answer")).toBeInTheDocument();
      });
    });
  });
});
