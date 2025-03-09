import React from "react";
import { cleanup, screen, render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

// lab 2: mock useCategory to prevent TypeError
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

// mock the navigate
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Why are the 2 blocks below commented out in the lab 2 solution?
// window.localStorage is used for tracking user's login state, but it's not used in Register.js. don't have to mock it.

// window.matchMedia is used for media queries, which Register.js doesn't depend on. but how does it prevent jest from crashing?
// if matchMedia is used, can be direct call, under antd, or react-responsive, then it will crash jest.

// Object.defineProperty(window, "localStorage", {
//   value: {
//     setItem: jest.fn(),
//     getItem: jest.fn(),
//     removeItem: jest.fn(),
//   },
//   writable: true,
// });

// // prevent jest from crashing
// window.matchMedia =
//   window.matchMedia ||
//   function () {
//     return {
//       matches: false,
//       addListener: function () {},
//       removeListener: function () {},
//     };
//   };

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

// define the test set
describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prevent pollution
  afterEach(() => {
    cleanup();
  });

  // Render the registration form and check initial elements
  it("renders the registration form with all inputs", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Check for the form title and each input's placeholder text
    expect(screen.getByText("REGISTER FORM")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your DOB")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What is Your Favorite sports")).toBeInTheDocument();
  });

  // Check that all input fields are empty initially
  it("renders the registration form with all inputs empty", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your DOB").value).toBe("");
    expect(screen.getByPlaceholderText("What is Your Favorite sports").value).toBe("");
  });

  // Verify that user can type into the form fields and the values update correctly
  it("allows the user to type into the form fields", async () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Simulate user input for each field
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { target: { value: "password123" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: "123 Main St" } });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), { target: { value: "1990-01-01" } });
    fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), { target: { value: "Soccer" } });

    // Verify that each input now contains the new value
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe("John Doe");
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("john@example.com");
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("password123");
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe("1234567890");
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe("123 Main St");
    expect(screen.getByPlaceholderText("Enter Your DOB").value).toBe("1990-01-01");
    expect(screen.getByPlaceholderText("What is Your Favorite sports").value).toBe("Soccer");
  });

  // Successful form submission leads to success toast and navigation to login
  it("should register the user and redirect successfully", async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        success: true 
      } 
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { 
      target: { value: "1234567890" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { 
      target: { value: "123 Main St" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), { 
      target: { value: "1990-01-01" } 
    });
    fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), { 
      target: { value: "Soccer" } 
    });

    // Submit the form
    fireEvent.click(screen.getByText("REGISTER"));

    // Verify that axios.post was called with an object that contains the key properties (using expect.objectContaining for flexibility)
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Main St",
          DOB: "1990-01-01",
          answer: "Soccer",
        })
      )
    );

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });

  // Failed registration due to API error response shows error toast
  it("shows error toast on failed registration", async () => {
    // Mock API response indicating failure
    axios.post.mockResolvedValueOnce({ 
      data: { 
        success: false,
        message: "User already exists",
      } 
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill in the form with sample data
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { 
      target: { value: "Jane Doe" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { 
      target: { value: "jane@example.com" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { 
      target: { value: "password456" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { 
      target: { value: "0987654321" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { 
      target: { value: "456 Side St" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), { 
      target: { value: "1995-05-05" } 
    });
    fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), { 
      target: { value: "Basketball" } 
    });

    // Submit the form
    fireEvent.click(screen.getByText("REGISTER"));

    // Assert that an error toast is shown with the message from the API, instead of a generic error message
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("User already exists"));

    // Ensure no navigation occurred on error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Network or unexpected errors show a generic error toast
  it("shows generic error toast when an exception occurs during registration", async () => {
    // Simulate a network or unexpected error by rejecting the promise
    axios.post.mockRejectedValueOnce({ 
      data: {
        message: "Network Error"
      }
    });

    render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill in the form with sample data
    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { 
      target: { value: "Jake Doe" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), { 
      target: { value: "jake@example.com" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { 
      target: { value: "password789" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { 
      target: { value: "1122334455" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { 
      target: { value: "789 Another Rd" } 
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your DOB"), { 
      target: { value: "1985-12-12" } 
    });
    fireEvent.change(screen.getByPlaceholderText("What is Your Favorite sports"), { 
      target: { value: "Tennis" } 
    });

    // Submit the form
    fireEvent.click(screen.getByText("REGISTER"));

    // Assert that a generic error toast is shown
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    );

    // Ensure navigation did not occur on exception
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  
});
