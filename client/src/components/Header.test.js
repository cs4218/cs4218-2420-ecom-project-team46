import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import Header from "./Header";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[]]),
}));

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => []),
}));

jest.mock("./Form/SearchInput", () => () => <></>);

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

describe("Header", () => {
  const renderHeaderComponent = () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  };

  it("should display e-commerce name", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /virtual vault/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("should display home link", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("should display the categories link", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /(?<!\bAll\s)categories/i });
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("should display all categories link", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /all categories/i });
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("should display the correct category link for each category", () => {
    const generateMockCategories = (min = 0, max = 10) => {
      const categoriesCount = Math.floor(Math.random() * (max - min + 1) + min);
      return Array.from({ length: categoriesCount }, () => {
        const name = faker.commerce.productName();
        return {
          _id: faker.string.uuid(),
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        };
      });
    };
    const mockCategories = generateMockCategories();
    useCategory.mockReturnValue(mockCategories);
    renderHeaderComponent();

    mockCategories.forEach(({ name, slug }) => {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", `/category/${slug}`);
    });
  });

  it("should display register and login links when the user is not signed in", () => {
    renderHeaderComponent();

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toHaveAttribute("href", "/register");
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should display username, dashboard and logout links when admin is signed in", () => {
    const mockedAdminCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 1,
      },
    };
    useAuth.mockImplementation(() => [mockedAdminCredentials, jest.fn()]);
    renderHeaderComponent();

    expect(
      screen.getByText(new RegExp(mockedAdminCredentials.user.name))
    ).toBeInTheDocument();
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
    const logoutLink = screen.getByRole("link", { name: /logout/i });
    expect(logoutLink).toHaveAttribute("href", "/login");
  });

  it("should display username, dashboard and logout links when user is signed in", () => {
    const mockedUserCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 0,
      },
    };
    useAuth.mockImplementation(() => [mockedUserCredentials, jest.fn()]);
    renderHeaderComponent();

    expect(
      screen.getByText(new RegExp(mockedUserCredentials.user.name))
    ).toBeInTheDocument();
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/user");
    const logoutLink = screen.getByRole("link", { name: /logout/i });
    expect(logoutLink).toHaveAttribute("href", "/login");
  });

  it("should log out the admin user when the logout link is clicked", async () => {
    const mockedAdminCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 1,
      },
    };
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: jest.fn(),
      },
      writable: true,
    });
    const mockedSetAuth = jest.fn();
    useAuth.mockImplementation(() => [mockedAdminCredentials, mockedSetAuth]);
    renderHeaderComponent();

    act(() => {
      userEvent.click(screen.getByRole("link", { name: /logout/i }));
    });

    expect(mockedSetAuth).toHaveBeenCalledWith({
      ...mockedAdminCredentials,
      user: null,
      token: "",
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });

  it("should log out the user when the logout link is clicked", async () => {
    const mockedUserCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 0,
      },
    };
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: jest.fn(),
      },
      writable: true,
    });
    const mockedSetAuth = jest.fn();
    useAuth.mockImplementation(() => [mockedUserCredentials, mockedSetAuth]);
    renderHeaderComponent();

    act(() => {
      userEvent.click(screen.getByRole("link", { name: /logout/i }));
    });

    expect(mockedSetAuth).toHaveBeenCalledWith({
      ...mockedUserCredentials,
      user: null,
      token: "",
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
    expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
  });

  it("should display cart link", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("href", "/cart");
  });

  it("should display 0 in cart badge when cart is empty", () => {
    renderHeaderComponent();

    expect(screen.getByTitle(0)).toBeInTheDocument();
  });

  it("should display cart items count in cart badge when cart is not empty", () => {
    const cartLength = Math.floor(Math.random() * 100) + 1;
    const cart = Array(cartLength);
    useCart.mockImplementation(() => [cart]);
    renderHeaderComponent();

    expect(screen.getByTitle(cartLength.toString())).toBeInTheDocument();
  });
});
