import React from "react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import toast from "react-hot-toast";
import "@testing-library/jest-dom/extend-expect";
import Products from "./Products";
import UpdateProduct from "./UpdateProduct";
import {
  screen,
  render,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const products = [
  {
    _id: "67a21772a6d9e00ef2ac022a",
    name: "NUS T-shirt",
    slug: "nus-tshirt",
    description: "Plain NUS T-shirt for sale",
    price: 4.99,
    category: {
      _id: "66db427fdb0119d9234b27ee",
      name: "Clothing",
      slug: "clothing",
      __v: 0,
    },
    quantity: 200,
    shipping: true,
    createdAt: "2024-09-06T17:57:19.992Z",
    updatedAt: "2024-09-06T17:57:19.992Z",
    __v: 0,
  },
  {
    _id: "66db427fdb0119d9234b27f1",
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 79.99,
    category: {
      _id: "66db427fdb0119d9234b27ef",
      name: "Book",
      slug: "book",
      __v: 0,
    },
    quantity: 50,
    shipping: false,
    createdAt: "2024-09-06T17:57:19.963Z",
    updatedAt: "2024-09-06T17:57:19.963Z",
    __v: 0,
  },
  {
    _id: "66db427fdb0119d9234b27f9",
    name: "Novel",
    slug: "novel",
    description: "A bestselling novel",
    price: 14.99,
    category: {
      _id: "66db427fdb0119d9234b27ef",
      name: "Book",
      slug: "book",
      __v: 0,
    },
    quantity: 200,
    shipping: true,
    createdAt: "2024-09-06T17:57:19.992Z",
    updatedAt: "2024-09-06T17:57:19.992Z",
    __v: 0,
  },
];

describe("Product component tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all products in list", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({ data: { products: products } });
      }
    });
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/dashboard/admin/products`]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });
    expect(screen.getByText(/All Products List/i)).toBeInTheDocument();

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();
    });
  });

  it("should have working links", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({ data: { products: products } });
      }
    });
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/dashboard/admin/products`]}>
          <Routes>
            <Route path="/dashboard/admin/products" element={<Products />} />
            <Route
              path="/dashboard/admin/product/:slug"
              element={<UpdateProduct />}
            />
          </Routes>
        </MemoryRouter>
      );
    });

    const link = await screen.getAllByTestId("product-link")[0];
    fireEvent.click(link);
    expect(screen.getByText("Update Product")).toBeInTheDocument();
  });
  it("shows a toast error message when fetching products fails", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.error(new Error("My Error"));
      }
    });
    render(
      <MemoryRouter initialEntries={[`/dashboard/admin/products`]}>
        <Routes>
          <Route path="/dashboard/admin/products" element={<Products />} />
          <Route
            path="/dashboard/admin/product/:slug"
            element={<UpdateProduct />}
          />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Something Went Wrong");
  });
});
