import React from "react";
import { screen, render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CategoryProduct from "./CategoryProduct";
import axios from "axios";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

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

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

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

const category = {
    "_id": "67ac52a0386736ef463c876d",
    "name": "Category 1",
    "slug": "category-1"
};

describe("CategoryProduct Component", () => {
  beforeEach(() => {
      jest.clearAllMocks();
      require("react-router-dom").useParams.mockReturnValue({ slug: `${category.slug}` });
      require("react-router-dom").useNavigate.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    cleanup();
  });

  it("should render title an number of results", async () => {

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: category,
        products: products
      }
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {expect(screen.getByText(`Category - ${category.name}`)).toBeInTheDocument();});
    await waitFor(() => {expect(screen.getByText(`${products.length} result found`)).toBeInTheDocument();});
  });

  it("should render product list", async () => {

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: category,
        products: products
      }
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`${product.price.toLocaleString("en-US", {style: "currency", currency: "USD"})}`)).toBeInTheDocument();
      expect(screen.getByText(`${product.description.substring(0, 30)}...`)).toBeInTheDocument();
    });});
  });

  it("should render 'More Details' buttons", async () => {

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: category,
        products: products
      }
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {
      const buttons = screen.getAllByText("More Details");
      expect(buttons.length).toBe(products.length);
    });

  });

  it("should render no results when API returns failure", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: false,
        error: "mockError",
        message: "mockMessage"
      }
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {expect(screen.getByText(`Category -`)).toBeInTheDocument();});
    await waitFor(() => {expect(screen.getByText(`0 result found`)).toBeInTheDocument();});
  });

  it("should no results when API has error", async () => {
    axios.get.mockRejectedValueOnce(new Error("mockError"));

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => {expect(screen.getByText(`Category -`)).toBeInTheDocument();});
    await waitFor(() => {expect(screen.getByText(`0 result found`)).toBeInTheDocument();});
  });

});
