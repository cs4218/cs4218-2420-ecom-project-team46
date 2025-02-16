import React from "react";
import { screen, render, act, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import ProductDetails from "./ProductDetails";
import axios from "axios";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const product = {
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
};

const relatedProducts = [
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

const setAxiosMock = (product, relatedProducts) => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/api/v1/product/get-product")) {
      return Promise.resolve({ data: { product: product } });
    }
    if (url.includes("/api/v1/product/related-product")) {
      return Promise.resolve({ data: { products: relatedProducts } });
    }
    if (url.includes("/api/v1/category")) {
      return Promise.resolve({ data: {} });
    }
    return Promise.reject(new Error("Not Found: " + url));
  });
};

describe("ProductDetails component tests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should correctly render products and similar products", async () => {
    setAxiosMock(product, relatedProducts);
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[`/product/${product.slug}`]}>
          <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      );
    });
    expect(screen.getByText("Product Details")).toBeInTheDocument();
    expect(screen.getByText("Name : " + product.name)).toBeInTheDocument();
    expect(
      screen.getByText("Description : " + product.description)
    ).toBeInTheDocument();
    expect(screen.getByText("Price :$" + product.price)).toBeInTheDocument();
    expect(
      screen.getByText("Category : " + product.category.name)
    ).toBeInTheDocument();
    expect(screen.getByText("Similar Products ➡️")).toBeInTheDocument();
    relatedProducts.forEach((p) =>
      expect(screen.getByText(p.name)).toBeInTheDocument()
    );
  });

  it("should show no similar products message if related products is empty", async () => {
    setAxiosMock(product, []);
    await act(async () =>
      render(
        <MemoryRouter initialEntries={[`/product/${product.slug}`]}>
          <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      )
    );
    expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
  });

  it("should correctly render images of products and similar products", async () => {
    setAxiosMock(product, relatedProducts);
    await act(async () =>
      render(
        <MemoryRouter initialEntries={[`/product/${product.slug}`]}>
          <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      )
    );
    expect(screen.getByAltText(product.name)).toBeInTheDocument();
    relatedProducts.forEach((p) =>
      expect(screen.getByAltText(p.name)).toBeInTheDocument()
    );
  });

  it("should have working add to cart buttons", async () => {
    jest.spyOn(Storage.prototype, "setItem");
    Storage.prototype.setItem = jest.fn();
    setAxiosMock(product, relatedProducts);
    const mockSetCart = jest.fn();
    useCart.mockReturnValue([[], mockSetCart]);

    const checkButton = (product, button) => {
      fireEvent.click(button);
      expect(mockSetCart).toHaveBeenCalledWith([product]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([product])
      );
      expect(toast.success).toHaveBeenLastCalledWith("Item Added to cart");
    };

    await act(async () =>
      render(
        <MemoryRouter initialEntries={[`/product/${product.slug}`]}>
          <Routes>
            <Route path="/product/:slug" element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      )
    );
    const addToCartButton = screen.getByTestId("add-to-cart");
    const addToCartButtons = screen.getAllByTestId("add-to-cart-related");
    expect(addToCartButtons.length).toBe(relatedProducts.length);
    checkButton(product, addToCartButton);
    addToCartButtons.forEach((button, index) => {
      checkButton(relatedProducts[index], button);
    });
    expect(toast.success).toHaveBeenCalledTimes(3);
  });
});
