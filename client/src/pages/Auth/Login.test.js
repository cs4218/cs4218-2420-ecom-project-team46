import React from "react";
import { cleanup, screen, render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Login from "./Login";  // import Login component. by default will look for .js file, since this is a .js file

// Mocking axios.post to prevent real POST requests
jest.mock("axios");
// prevent real toast notifications
jest.mock("react-hot-toast");

const mockSetAuth = jest.fn(); // Create a reusable mock function

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, mockSetAuth]), // Now setAuth is trackable
}));

// cart is not required
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

// search not required
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

// lab 2: mock useCategory to prevent TypeError
// no real cat data is required
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

// mock Layout, which appears in UI rendering
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

// use jest.fn() to mock localStorage, so that data wont be saved to localStorage during testing
Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// in certain environment, window.matchMedia could be undefined. but some UI lib will use window.matchMedia to detect dark mode. mocking this method to prevent error in Jest
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

// describe: to organize multiple test cases
describe("Login Component", () => {
  // before each test, clear the mock data created by jest.mock(), to prevent pollution
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prevent pollution
  afterEach(() => {
    cleanup();
  });

  // test whether the login form is correctly rendered
  // what's inside "double quote" is the description
  // () => {} is the real logic
  it("renders login form", async () => {
    // render(): ask Jest to create a virtual DOM
    render(
      // MemoryRouter: a special router that is used for testing, to allow Jest to mock the routing
      // set the URL as /login, to correctly load Login.js
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          {/* if visiting /login, render <Login /> */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // when login component is rendered, login form/email box/password box should be there
    // getByText will look for titles/paragraphs/buttons
    // getByPlaceholderText will look for input boxes
    expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
  });

  // similar to the previous one, just that it's looking for .value to be empty
  it("inputs should be initially empty", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();  // this is already tested
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("");
  });

  it("should allow typing email and password", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // fireEvent.change() mimics user input
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      "test@example.com"
    );
    expect(screen.getByPlaceholderText("Enter Your Password").value).toBe(
      "password123"
    );
  });

  it("should login the user successfully", async () => {
    // mock the response from API
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        // res.data.message is used in Login.js
        message: "login successfully",
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("LOGIN"));

    // axios.post() is async, so we use await waitFor() for it to finish
    // check whether axios.post() has been called with the critical data (email and password), at the same time it won't break if the API call's structture changes in non-critical ways
    // also, endpoint might change ==> leave it as expect.anything()
    await waitFor(() => 
      expect(axios.post).toHaveBeenCalledWith(expect.anything(),
        expect.objectContaining({
          email: "test@example.com",
          password: "password123",
        })
      )
    );

    // maximize the resistance to refactoring
    // Instead of checking the exact toast call, just ensure that a success notification is shown
    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    // Ensure setAuth updates the auth state
    await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());

    // Ensure localStorage is updated
    await waitFor(() =>
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "auth",
        expect.stringContaining("John Doe") // verify in a more abstract way
      )
    );

    // Ensure user is redirected
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  it("should display error message when credentials are incorrect", async () => {
    // Mock API response where login fails due to wrong credentials
    axios.post.mockResolvedValueOnce({
      data: { 
        success: false, 
        message: "Invalid email or password",
      },
    });
  
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByText("LOGIN"));
  
    // Ensure axios.post was called
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(expect.anything(),
        expect.objectContaining({
          email: "wrong@example.com",
          password: "wrongpassword",
        })
      )
    );
  
    // Expect toast.error to be called
    await waitFor(() => 
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password"));
  });

  it("should display a generic error message when login fails due to server/database error", async () => {
    // Mock API request failure (server down, database error, etc.)
    axios.post.mockRejectedValueOnce({
      data: {
        success: false,
        message: "Error in login",
      },
    });
  
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
  
    fireEvent.click(screen.getByText("LOGIN"));
  
    // Ensure axios.post was called
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(expect.anything(),
        expect.objectContaining({
          email: "user@example.com",
          password: "password123",
        })
      )
    );
  
    // expect toast.error to be called, but will a "somthing went wrong" message, which is specific to login fails due to error, different from incorrect login credentials
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    );
  });

  // // during testing, when clicking on "Forgot Password", it results in 404
  // it("should navigate to forgot-password page when clicking 'Forgot Password' button", () => {
  //   render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //         <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
  //       </Routes>
  //     </MemoryRouter>
  //   );
  
  //   fireEvent.click(screen.getByText("Forgot Password"));
  
  //   expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
  // });
  
});
