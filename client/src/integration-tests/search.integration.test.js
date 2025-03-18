import React from "react";
import { render, screen, fireEvent, act, cleanup, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import slugify from "slugify";
import axios from "axios";

import Search from "../pages/Search";
import SearchInput from "../components/Form/SearchInput";

const { useSearch } = require("../context/search");
const { useCart } = require("../context/cart");

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

const mockSetValues = jest.fn();
jest.mock("../context/search", () => ({
  useSearch: jest.fn()
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockedUsedNavigate,
  };
});

const products = [
  { 
    _id: "67ac530c1e43cbc3c3fffe97", 
    name: "Product 1", 
    slug: "product-1", 
    description: "Description 1", 
    price: 100,
    category: "67ac54165e8975843b7b6064",
    quantity: 5,
    photo: "mockBuffer",
    shipping: true
  },
  { 
    _id: "67ac544eb0be4841b3b1ff9f", 
    name: "Product 2", 
    slug: "product-2", 
    description: "Description 2", 
    price: 200,
    category: "67ac54165e8975843b7b6064",
    quantity: 15,
    photo: "mockBuffer",
    shipping: false
  },
  { 
    _id: "67ac5454247080496d0e9cf4", 
    name: "Product 3", 
    slug: "product-3", 
    description: "Description 3", 
    price: 300,
    category: "67ac5459eb3c376326aa5f16",
    quantity: 8,
    photo: "mockBuffer",
    shipping: true
  },
];

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules()
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Search Page Integration", () => {

  it("should call navigate when 'More Details' button is clicked", async () => {
    const mockResults = [
      {
        _id: "p1",
        name: "Laptop",
        slug: slugify("Laptop"),
        description: "A powerful laptop for all your computing needs.",
        price: 1500,
        category: "c1",
        quantity: 10,
        shipping: true,
      },
    ];

    useSearch.mockReturnValue([{ results: mockResults }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("More Details"));
    });

    expect(mockedUsedNavigate).toHaveBeenCalledWith(`/product/${slugify("Laptop")}`);
  });

  it("should add product to cart and shows a toast message when 'ADD TO CART' is clicked", async () => {
    const product = {
      _id: "p1",
      name: "Laptop",
      slug: slugify("Laptop"),
      description: "A powerful laptop for all your computing needs.",
      price: 1500,
      category: "c1",
      quantity: 10,
      shipping: true,
    };

    useSearch.mockReturnValue([{ results: [product] }, jest.fn()]);
    let mockCart = [];
    const mockSetCart = jest.fn(newCart => { mockCart = newCart; });
    useCart.mockReturnValue([mockCart, mockSetCart]);

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("ADD TO CART"));
    });

    expect(mockSetCart).toHaveBeenCalledWith(expect.arrayContaining([product]));

    localStorage.setItem("cart", JSON.stringify([product]));
    const cartData = JSON.parse(localStorage.getItem("cart"));
    expect(cartData).toEqual(expect.arrayContaining([product]));
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("should call API and navigates on form submission in SearchInput and display results in Search", async () => {
    
    axios.get.mockResolvedValueOnce({ data: products });
    useSearch.mockReturnValueOnce([{ keyword: "Product", results: [] }, mockSetValues])
      .mockReturnValueOnce([{ keyword: "Product", results: products }, mockSetValues]);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<SearchInput />} />
        </Routes>
      </MemoryRouter>
    );

    const inputField = screen.getByPlaceholderText("Search");
    fireEvent.change(inputField, { target: { value: "Product" } });
    
    const searchButton = screen.getByRole("button", { name: /search/i });
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/search/${slugify('Product')}`);
    });
    
    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: "Product", results: products });
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/search");
    });

    cleanup();

    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {expect(screen.getByText("Search Results")).toBeInTheDocument();});
    
    await waitFor(() => {
      expect(screen.getByText(`Found ${products.length}`)).toBeInTheDocument();
    });
    
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

});
