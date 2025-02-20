import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import SearchInput from "./SearchInput";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

jest.mock("axios");

const mockSetValues = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, mockSetValues]), 
}));

const products = [
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
];

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("SearchInput Component", () => {
  
    
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render search input and button", () => {
    render(<SearchInput />);

    const inputField = screen.getByPlaceholderText("Search");
    const searchButton = screen.getByRole("button", { name: /search/i });

    expect(inputField).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
  });

  it("should update search keyword on input change", async () => {

    render(<SearchInput />);

    const inputField = screen.getByPlaceholderText("Search");
    fireEvent.change(inputField, { target: { value: "laptop" } });

    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: "laptop" });
    });
  });

  it("should call API and navigate on form submission", async () => {
    axios.get.mockResolvedValueOnce({ data: products });

    render(<SearchInput />);

    const inputField = screen.getByPlaceholderText("Search");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(inputField, { target: { value: "phone" } });
    fireEvent.click(searchButton);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(mockSetValues).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockSetValues).toHaveBeenNthCalledWith(1, { keyword: "phone"}));
    await waitFor(() => expect(mockSetValues).toHaveBeenNthCalledWith(2, { keyword: "", results: products }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/search"));
  });

  it("should handle API errors gracefully", async () => {
    axios.get.mockRejectedValueOnce(new Error("mockError"));

    render(<SearchInput />);

    const inputField = screen.getByPlaceholderText("Search");
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(inputField, { target: { value: "tablet" } });
    fireEvent.click(searchButton);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {
      expect(mockSetValues).not.toHaveBeenCalledWith(expect.objectContaining({ results: expect.any(Array) }));
    });
  });

});