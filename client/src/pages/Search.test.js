import React from "react";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Search from "./Search";
import { useSearch } from "../context/search";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
}));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("react-hot-toast");

const productsFound = [
  { _id: "67ac530c1e43cbc3c3fffe97", 
    name: "Product 1", 
    slug: "product-1", 
    description: "Description 1", 
    price: 100,
    category: "67ac54165e8975843b7b6064",
    quantity: 5,
    photo: "mockBuffer",
    shipping: true
  },
  { _id: "67ac544eb0be4841b3b1ff9f", 
    name: "Product 2", 
    slug: "product-2", 
    description: "Description 2", 
    price: 200,
    category: "67ac54165e8975843b7b6064",
    quantity: 15,
    photo: "mockBuffer",
    shipping: false
  },
  { _id: "67ac5454247080496d0e9cf4", 
    name: "Product 3", 
    slug: "product-3", 
    description: "Description 3", 
    price: 300,
    category: "67ac5459eb3c376326aa5f16",
    quantity: 8,
    photo: "mockBuffer",
    shipping: true
  },
]

describe("Search Component", () => {
  it("should display 'No Products Found' when there are no results", async () => {

    useSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("should display the number of products found", async () => {
    useSearch.mockReturnValue([{ results: productsFound }, jest.fn()]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getByText(`Found ${productsFound.length}`)).toBeInTheDocument();
  });

  it("should render product cards when there are results", async () => {
    useSearch.mockReturnValue([{ results: productsFound }, jest.fn()]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    productsFound.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`$ ${product.price}`)).toBeInTheDocument();
      expect(screen.getByText(`${product.description.substring(0, 30)}...`)).toBeInTheDocument();
    });
  });

  it("should render 'More Details' and 'ADD TO CART' buttons for each product", async () => {
    useSearch.mockReturnValue([{ results: productsFound }, jest.fn()]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    expect(screen.getAllByText("More Details").length).toBe(productsFound.length);
    expect(screen.getAllByText("ADD TO CART").length).toBe(productsFound.length);
  });

});