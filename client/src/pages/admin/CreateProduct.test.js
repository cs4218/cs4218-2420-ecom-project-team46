import React from "react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "@testing-library/jest-dom/extend-expect";
import CreateProduct from "./CreateProduct";
import Products from "./Products";
import {
  screen,
  render,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { beforeEach } from "node:test";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const categories = [
  {
    _id: "66db427fdb0119d9234b27ed",
    name: "Electronics",
    slug: "electronics",
    __v: 0,
  },
  { _id: "66db427fdb0119d9234b27ef", name: "Book", slug: "book", __v: 0 },
  {
    _id: "66db427fdb0119d9234b27ee",
    name: "Clothing",
    slug: "clothing",
    __v: 0,
  },
];

describe("CreateProduct component tests", () => {
  beforeEach(() => jest.clearAllMocks());
  axios.get.mockImplementation((url) => {
    if (url.includes("/api/v1/category/get-category")) {
      return Promise.resolve({ data: { categories } });
    }
    if (url.includes("/api/v1/product/get-product")) {
      return Promise.resolve({ data: {} });
    }
    return Promise.reject(new Error("Not Found: " + url));
  });
  it("should render the form correctly", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/dashboard/admin/create-product`]}>
          <Routes>
            <Route
              path="/dashboard/admin/create-product"
              element={<CreateProduct />}
            />
          </Routes>
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByTestId("category-selector")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
  });

  it("should correctly submit the form with post request", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({ data: {} });
      }

      return Promise.reject(new Error("Not Found: " + url));
    });
    axios.post.mockImplementation((url) => {
      return Promise.resolve({
        success: true,
        counTotal: 7,
        message: "All Products",
        products: [],
      });
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/dashboard/admin/create-product`]}>
          <Routes>
            <Route
              path="/dashboard/admin/create-product"
              element={<CreateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });
    fireEvent.click(screen.getByText("CREATE PRODUCT"));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Product Created Successfully"
      );
    });
    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/product/create-product",
      expect.any(FormData)
    );
  });
  it("should correctly toast when error", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes("/api/v1/product/get-product")) {
        return Promise.resolve({ data: {} });
      }

      return Promise.reject(new Error("Not Found: " + url));
    });
    axios.post.mockImplementation((url) => {
      return Promise.resolve({
        data: {
          success: false,
        },
      });
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/dashboard/admin/create-product`]}>
          <Routes>
            <Route
              path="/dashboard/admin/create-product"
              element={<CreateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });
    fireEvent.click(screen.getByText("CREATE PRODUCT"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
