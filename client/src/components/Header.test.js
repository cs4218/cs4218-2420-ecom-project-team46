import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useSearch } from "../context/search";
import useCategory from "../hooks/useCategory";
import Header from "./Header";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(() => [[], jest.fn()]),
}));

describe("Header", () => {
  const renderHeaderComponent = () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Header />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should render e-commerce name", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /virtual vault/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("should render empty search input and search button", () => {
    renderHeaderComponent();

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.value).toBe("");
    const searchButton = screen.getByText(/search/i);
    expect(searchButton).toBeInTheDocument();
  });

  it("should search based on user input", async () => {
    const keyword = faker.commerce.productName();
    useSearch.mockImplementation(() => [{ keyword }, jest.fn()]);
    renderHeaderComponent();

    const searchInput = screen.getByRole("searchbox", { name: "Search" });
    expect(searchInput).toBeInTheDocument();
    userEvent.type(searchInput, keyword);
    expect(screen.getByPlaceholderText(/search/i).value).toMatch(
      new RegExp(keyword)
    );
    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeInTheDocument();
    userEvent.click(searchButton);
    expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/search/${keyword}`);
  });

  it("should render home button", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("should render categories button", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /(?<!\bAll\s)categories/i });
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("should render all categories button", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /all categories/i });
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("should render each respective category link", () => {
    const generateMockCategories = () => {
      const categories = [];
      const min = 0;
      const max = 10;
      const count = Math.floor(Math.random() * (max - min + 1) + min);
      for (let i = 0; i < count; i += 1) {
        const name = faker.commerce.productName();
        categories.push({
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        });
      }
      return categories;
    };
    const mockCategories = generateMockCategories();
    useCategory.mockReturnValue(mockCategories);
    renderHeaderComponent();

    mockCategories.forEach(({ name, slug }) => {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", `/category/${slug}`);
    });
  });

  it("should render register and login links when not signed in", () => {
    renderHeaderComponent();

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toHaveAttribute("href", "/register");
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should render username, dashboard and logout links when admin is signed in", () => {
    const mockAdminCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 1,
      },
    };
    useAuth.mockImplementation(() => [mockAdminCredentials, jest.fn()]);
    renderHeaderComponent();

    expect(
      screen.getByText(new RegExp(mockAdminCredentials.user.name))
    ).toBeInTheDocument();
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
    const logoutLink = screen.getByRole("link", { name: /logout/i });
    expect(logoutLink).toHaveAttribute("href", "/login");
  });

  it("should render username, dashboard and logout links when user is signed in", () => {
    const mockUserCredentials = {
      user: {
        name: faker.person.fullName(),
        role: 0,
      },
    };
    useAuth.mockImplementation(() => [mockUserCredentials, jest.fn()]);
    renderHeaderComponent();

    expect(
      screen.getByText(new RegExp(mockUserCredentials.user.name))
    ).toBeInTheDocument();
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/user");
    const logoutLink = screen.getByRole("link", { name: /logout/i });
    expect(logoutLink).toHaveAttribute("href", "/login");
  });

  it("should render Cart button", () => {
    renderHeaderComponent();

    const link = screen.getByRole("link", { name: /cart/i });
    expect(link).toHaveAttribute("href", "/cart");
  });
});
