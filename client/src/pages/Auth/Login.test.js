import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
// import Login component. by default will look for .js file, since this is a .js file
import Login from "./Login";

// Mocking axios.post
// prevent real POST requests
jest.mock("axios");
// prevent real toast notifications
jest.mock("react-hot-toast");

// real user data is not required
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
  // null: assume not logged in
  // setAuth() = jest.fn(): wont change auth, but we can use jest to check whether it has been called
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

// describe: to organize multiple test cases
describe("Login Component", () => {
  // before each test, clear the mock data created by jest.mock(), to prevent pollution
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test whether the login form is correctly rendered
  // what's inside "double quote" is the description
  // () => {} is the real logic
  it("renders login form", () => {
    // what is { }? Destructuring Assignment. the two getBys are methods provided by React Testing Library, used for finding UI elements during testing
    // why const? because the two methods wont change
    // getByText will look for titles/paragraphs/buttons
    // getByPlaceholderText will look for input boxes
    // render(): ask Jest to create a virtual DOM
    const { getByText, getByPlaceholderText } = render(
      // MemoryRouter: a special router that is used for testing, to allow Jest to mock the routing
      // useNav() and useLoc() relies on React Router
      // set the URL as /login, to correctly load Login.js
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          {/* if visiting /login, render <Login /> */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // when login component is rendered, login form/email box/password box should be there
    expect(getByText("LOGIN FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
  });

  // similar to the previous one, just that it's looking for .value to be empty
  it("inputs should be initially empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("LOGIN FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Email").value).toBe("");
    expect(getByPlaceholderText("Enter Your Password").value).toBe("");
  });

  it("should allow typing email and password", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // fireEvent.change() mimics user input
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    expect(getByPlaceholderText("Enter Your Email").value).toBe(
      "test@example.com"
    );
    expect(getByPlaceholderText("Enter Your Password").value).toBe(
      "password123"
    );
  });

  it("should login the user successfully", async () => {
    // mock the response from API
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    // axios.post() is async, so we use await waitFor() for it to finish
    // check whether axios.post() has been called
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // to ensure that toast.success() is called after API returns
    // but undefined seems abit weird... it should be res.data.message
    // okay it's actually it is correct, because we are mocking the response, which does not define the message, and that content is not important. we are just checking whether toast.success() is called
    expect(toast.success).toHaveBeenCalledWith(undefined, {
      duration: 5000,
      icon: "🙏",
      style: {
        background: "green",
        color: "white",
      },
    });
  });

  it("should display error message on failed login", async () => {
    axios.post.mockRejectedValueOnce({ message: "Invalid credentials" });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    // should match with Login.js instead of the message defined in the axios.post mock
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});
