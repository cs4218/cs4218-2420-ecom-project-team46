import React from "react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "@testing-library/jest-dom/extend-expect";
import UpdateProduct from "./UpdateProduct";
import Products from "./Products";
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

const mockNavigate = jest.fn();
useNavigate.mockReturnValue(mockNavigate);

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
const product = {
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
};

describe("UpdateProduct component tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render product correctly", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes(`/api/v1/product/get-product/${product.slug}`)) {
        return Promise.resolve({ data: { product: product } });
      }
      return Promise.reject(new Error("Not Found: " + url));
    });
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[`/dashboard/admin/products/${product.slug}`]}
        >
          <Routes>
            <Route
              path="/dashboard/admin/products/:slug"
              element={<UpdateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Update Product")).toBeInTheDocument();
    expect(screen.getByDisplayValue(product.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(product.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(product.price)).toBeInTheDocument();
    expect(screen.getByDisplayValue(product.quantity)).toBeInTheDocument();
  });
  it("should update product correctly", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes(`/api/v1/product/get-product/${product.slug}`)) {
        return Promise.resolve({ data: { product: product } });
      }
      return Promise.reject(new Error("Not Found: " + url));
    });
    axios.put.mockImplementation((url) => {
      return Promise.resolve({ data: { success: true } });
    });

    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[`/dashboard/admin/products/${product.slug}`]}
        >
          <Routes>
            <Route
              path="/dashboard/admin/products/:slug"
              element={<UpdateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const updateButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(updateButton);
    expect(axios.put).toHaveBeenCalledWith(
      `/api/v1/product/update-product/${product._id}`,
      expect.any(FormData)
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully")
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products")
    );
  });
  it("should delete product correctly", async () => {
    window.prompt = jest.fn().mockReturnValue("Yes");

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes(`/api/v1/product/get-product/${product.slug}`)) {
        return Promise.resolve({ data: { product: product } });
      }
      return Promise.reject(new Error("Not Found: " + url));
    });
    axios.put.mockImplementation((url) => {
      return Promise.resolve({ data: {} });
    });
    axios.delete.mockImplementation((url) => {
      return Promise.resolve({ data: {} });
    });
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[`/dashboard/admin/products/${product.slug}`]}
        >
          <Routes>
            <Route
              path="/dashboard/admin/products/:slug"
              element={<UpdateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const deleteButton = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);
    expect(axios.delete).toHaveBeenCalledWith(
      `/api/v1/product/delete-product/${product._id}`
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Product Deleted Successfully")
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products")
    );
  });
  it("should toast error on failed delete/update", async () => {
    window.prompt = jest.fn().mockReturnValue("Yes");
    const errorText = "my_error";

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/v1/category/get-category")) {
        return Promise.resolve({ data: { categories } });
      }
      if (url.includes(`/api/v1/product/get-product/${product.slug}`)) {
        return Promise.resolve({ data: { product: product } });
      }
      return Promise.reject(new Error("Not Found: " + url));
    });
    axios.put.mockImplementation((url) => {
      return Promise.resolve({
        data: { success: false, message: errorText },
      });
    });
    axios.delete.mockImplementation((url) => {
      return Promise.reject(new Error("Delete Error"));
    });
    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={[`/dashboard/admin/products/${product.slug}`]}
        >
          <Routes>
            <Route
              path="/dashboard/admin/products/:slug"
              element={<UpdateProduct />}
            />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const deleteButton = screen.getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong deleting the product"
      )
    );

    const updateButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(updateButton);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(errorText));
  });
});
