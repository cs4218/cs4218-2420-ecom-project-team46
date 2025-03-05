import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import React from "react";
import { act } from "react-dom/test-utils";
import toast from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import { useCart } from "../context/cart";
import HomePage from "./HomePage";

jest.mock("../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../components/Prices", () => ({
  Prices: [
    { _id: "1", name: "$0 - $49", array: [0, 49] },
    { _id: "2", name: "$50 - $99", array: [50, 99] },
  ],
}));

jest.mock("axios");

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[], jest.fn()]),
}));

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

const renderHomePage = () => {
  render(
    <Router>
      <HomePage />
    </Router>
  );
};

const categories = [
  { _id: faker.string.uuid(), name: "Category 1" },
  { _id: faker.string.uuid(), name: "Category 2" },
];

const products = [
  {
    _id: faker.string.uuid(),
    name: "Product 1",
    price: 0,
    description: "Description 1",
    category: categories[0]._id,
    slug: faker.lorem.slug(1),
  },
  {
    _id: faker.string.uuid(),
    name: "Product 2",
    price: 49,
    description: "Description 2",
    category: categories[1]._id,
    slug: faker.lorem.slug(1),
  },
  {
    _id: faker.string.uuid(),
    name: "Product 3",
    price: 50,
    description: "Description 3",
    category: categories[0]._id,
    slug: faker.lorem.slug(1),
  },
  {
    _id: faker.string.uuid(),
    name: "Product 4",
    price: 99,
    description: "Description 4",
    category: categories[1]._id,
    slug: faker.lorem.slug(1),
  },
];

axios.get.mockImplementation((url) => {
  switch (url) {
    case "/api/v1/category/get-category": {
      return Promise.resolve({
        data: {
          success: true,
          category: categories,
        },
      });
    }
    case "/api/v1/product/product-count": {
      return Promise.resolve({
        data: { success: true, total: 4 },
      });
    }
    case "/api/v1/product/product-list/2": {
      return Promise.resolve({
        data: {
          success: true,
          products: [products[3]],
        },
      });
    }
  }
});

describe("HomePage component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display an image with src matching 'virtual'", async () => {
    renderHomePage();

    await waitFor(() => {
      const image = screen.getByRole("img", { name: /bannerimage/i });
      expect(image).toBeInTheDocument();
      expect(image.src).toMatch(/virtual/i);
    });
  });

  it("should display all category options and filter based on the selected category", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/filter by category/i)).toBeInTheDocument();
      expect(screen.getByText(categories[0].name)).toBeInTheDocument();
      expect(screen.getByText(categories[1].name)).toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[0], products[2]],
      },
    });

    act(() => {
      userEvent.click(screen.getByLabelText(categories[0].name));
    });

    await waitFor(() => {
      expect(screen.getByLabelText(categories[0].name).checked).toBe(true);
      expect(screen.getByLabelText(categories[1].name).checked).toBe(false);
      expect(screen.getByText(products[0].name)).toBeInTheDocument();
      expect(screen.getByText(products[2].name)).toBeInTheDocument();
      expect(screen.queryByText(products[1].name)).not.toBeInTheDocument();
      expect(screen.queryByText(products[3].name)).not.toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: {
        products,
      },
    });

    act(() => {
      userEvent.click(screen.getByText(/reset filters/i));
    });

    await waitFor(() => {
      expect(screen.getByLabelText(categories[0].name).checked).toBe(false);
      expect(screen.getByLabelText(categories[1].name).checked).toBe(false);
      for (let i = 0; i < products.length; i += 1) {
        expect(screen.getByText(products[i].name)).toBeInTheDocument();
      }
    });
  });

  it("should display all price range options and filter based on the selected price range", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/filter by price/i)).toBeInTheDocument();
      expect(screen.getByText("$0 - $49")).toBeInTheDocument();
      expect(screen.getByText("$50 - $99")).toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[0], products[1]],
      },
    });

    act(() => {
      userEvent.click(screen.getByLabelText("$0 - $49"));
    });

    await waitFor(() => {
      expect(screen.getByLabelText("$0 - $49").checked).toBe(true);
      expect(screen.getByLabelText("$50 - $99").checked).toBe(false);
      expect(screen.getByText(products[0].name)).toBeInTheDocument();
      expect(screen.getByText(products[1].name)).toBeInTheDocument();
      expect(screen.queryByText(products[2].name)).not.toBeInTheDocument();
      expect(screen.queryByText(products[3].name)).not.toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[2], products[3]],
      },
    });

    act(() => {
      userEvent.click(screen.getByLabelText("$50 - $99"));
    });

    await waitFor(() => {
      expect(screen.getByLabelText("$0 - $49").checked).toBe(false);
      expect(screen.getByLabelText("$50 - $99").checked).toBe(true);
      expect(screen.getByText(products[2].name)).toBeInTheDocument();
      expect(screen.getByText(products[3].name)).toBeInTheDocument();
      expect(screen.queryByText(products[0].name)).not.toBeInTheDocument();
      expect(screen.queryByText(products[1].name)).not.toBeInTheDocument();
    });

    axios.post.mockResolvedValueOnce({
      data: {
        products,
      },
    });

    act(() => {
      userEvent.click(screen.getByText(/reset filters/i));
    });

    await waitFor(() => {
      expect(screen.getByLabelText("$0 - $49").checked).toBe(false);
      expect(screen.getByLabelText("$50 - $99").checked).toBe(false);
      for (let i = 0; i < products.length; i += 1) {
        expect(screen.getByText(products[i].name)).toBeInTheDocument();
      }
    });
  });

  it("should display a header with text matching 'products'", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/products/i)).toBeInTheDocument();
    });
  });

  it("should display individual product card for each product", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[0]],
      },
    });
    renderHomePage();

    await waitFor(() => {
      const image = screen.getByAltText(products[0].name);
      expect(image).toBeInTheDocument();
      expect(image.src).toMatch(new RegExp(products[0]._id));
      expect(screen.getByText(products[0].name)).toBeInTheDocument();
      expect(
        screen.getByText(`$${products[0].price.toFixed(2)}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${products[0].description}...`)
      ).toBeInTheDocument();
      expect(screen.getByText(/more details/i)).toBeInTheDocument();
      expect(screen.getByText(/add to cart/i)).toBeInTheDocument();
    });
  });

  it("should navigate to product details page when more details button of the individual product is clicked", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[0]],
      },
    });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/more details/i)).toBeInTheDocument();
    });

    act(() => {
      userEvent.click(screen.getByText(/more details/i));
    });

    expect(mockedUseNavigate).toHaveBeenCalledWith(
      `/product/${products[0].slug}`
    );
  });

  it("should set cart, save to local storage and display toast success message when added to cart", async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
      },
      writable: true,
    });
    axios.post.mockResolvedValueOnce({
      data: {
        products: [products[0]],
      },
    });
    const mockedSetCart = jest.fn();
    useCart.mockReturnValue([[], mockedSetCart]);
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/add to cart/i)).toBeInTheDocument();
    });

    act(() => {
      userEvent.click(screen.getByText(/add to cart/i));
    });

    await waitFor(() => {
      expect(mockedSetCart).toHaveBeenCalledWith([products[0]]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([products[0]])
      );
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });

  it("should load next page when load more button is clicked", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        products: products.slice(0, -1),
      },
    });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/load more/i)).toBeInTheDocument();
    });

    act(() => {
      userEvent.click(screen.getByText(/load more/i));
    });

    await waitFor(() => {
      const image = screen.getByAltText(products[3].name);
      expect(image).toBeInTheDocument();
      expect(image.src).toMatch(new RegExp(products[3]._id));
      expect(screen.getByText(products[3].name)).toBeInTheDocument();
      expect(
        screen.getByText(`$${products[3].price.toFixed(2)}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${products[3].description}...`)
      ).toBeInTheDocument();
    });
  });

  it("should hide the load more button when all products are displayed", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        products,
      },
    });
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/all products/i)).toBeInTheDocument();
      for (let i = 0; i < products.length; i += 1) {
        expect(screen.getByText(products[i].name)).toBeInTheDocument();
      }
      expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
    });
  });
});
