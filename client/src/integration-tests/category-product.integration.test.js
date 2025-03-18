import React from "react";
import axios from "axios";
import { render, screen, cleanup, waitFor, fireEvent, within, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Categories from "../pages/Categories";
import CategoryProduct from "../pages/CategoryProduct";
import ProductDetails from "../pages/ProductDetails";
import useCategory from "../hooks/useCategory";

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

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockedUsedNavigate
  };
});

const categories = [
  {
    "_id": "67ac52a0386736ef463c876d",
    "name": "Category 1",
    "slug": "category-1"
  },
  {
    "_id": "67ac52b9cbd13114f6acea9f",
    "name": "Category 2",
    "slug": "category-2"
  },
  {
    "_id": "67ac53bc656986b34cc98dc4",
    "name": "Category 3",
    "slug": "category-3"
  }
];

const products = [
  { _id: "67ac530c1e43cbc3c3fffe97", 
    name: "Product 1", 
    slug: "product-1", 
    description: "Description 1", 
    price: 100,
    category: "67ac52a0386736ef463c876d",
    quantity: 5,
    photo: "mockBuffer",
    shipping: true
  },
  { _id: "67ac544eb0be4841b3b1ff9f", 
    name: "Product 2", 
    slug: "product-2", 
    description: "Description 2", 
    price: 200,
    category: "67ac52a0386736ef463c876d",
    quantity: 15,
    photo: "mockBuffer",
    shipping: false
  },
  { _id: "67ac5454247080496d0e9cf4", 
    name: "Product 3", 
    slug: "product-3", 
    description: "Description 3", 
    price: 300,
    category: "67ac53bc656986b34cc98dc4",
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
});

afterEach(() => {
  cleanup();
});

describe("CategoryProduct Page Integration", () => {

  it("should call API and return products of (non-empty) category when slug is provided", async () => {

    const category = categories[0];

    jest.spyOn(require("react-router-dom"), "useParams").mockReturnValueOnce({slug: category.slug});
    
    const productCategory = products.filter(
      (product) => product.category === category._id
    );
    
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: category, products: productCategory },
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/product-category/${category.slug}`);
    });

    await waitFor(() => {expect(screen.getByText(`Category - ${category.name}`)).toBeInTheDocument();});
    await waitFor(() => {expect(screen.getByText(`${productCategory.length} result found`)).toBeInTheDocument();});
  });

  it("should call API and return no products of (empty) category when slug is provided", async () => {

    const category = categories[2];

    jest.spyOn(require("react-router-dom"), "useParams").mockReturnValueOnce({slug: category.slug});
    
    const productCategory = products.filter(
      (product) => product.category === category._id
    );
    
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: category, products: productCategory },
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/product-category/${category.slug}`);
    });

    await waitFor(() => {expect(screen.getByText(`Category - ${category.name}`)).toBeInTheDocument();});
    await waitFor(() => {expect(screen.getByText(`${productCategory.length} result found`)).toBeInTheDocument();});
  });
    
  it("should not call the API and render default UI when no slug is provided", async () => {

    const category = categories[0];

    jest.spyOn(require("react-router-dom"), "useParams").mockReturnValue({});

    const productCategory = products.filter(
      (product) => product.category === category._id
    );

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: category, products: productCategory },
    });

    render(
      <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});

describe("Categories and CategoryProduct Pages Integration", () => {
  it("should be navigated to the correct CategoryProduct pages and each product link should be navigated to correct ProductDetails page", async () => {
    
    useCategory.mockReturnValue([...categories]);

    for (const category of categories) {

      jest.spyOn(require("react-router-dom"), "useParams").mockReturnValueOnce({slug: category.slug});

      const productCategory = products.filter(
        (product) => product.category === category._id
      );
      
      axios.get.mockResolvedValue({
        data: {
          products: productCategory,
          category: category
        }
      });

      render(
        <MemoryRouter initialEntries={["/categories"]}>
          <Routes>
            <Route path="/categories" element={<Categories />} />
            <Route
              path="/category/:slug"
              element={<CategoryProduct/>} />
            <Route path="/product/:slug" 
              element={<ProductDetails />} />
          </Routes>
        </MemoryRouter>
      );

      const main = screen.getByRole("main");
      const link = within(main).getByRole("link", { name: category.name });
      expect(link).toHaveAttribute("href", `/category/${category.slug}`);;
      
      await act(async () => {
        fireEvent.click(link);
      });

      await waitFor(() => {expect(screen.getByText(`Category - ${category.name}`)).toBeInTheDocument();});
      await waitFor(() => {expect(screen.getByText(`${productCategory.length} result found`)).toBeInTheDocument();});
      await waitFor(() => {
        productCategory.forEach((product) => {
          expect(screen.getByText(product.name)).toBeInTheDocument();
        });
      });

      if (productCategory.length > 0) {
        const moreDetailsButtons = screen.getAllByRole("button", { name: /more details/i });
        await waitFor(() => {
          moreDetailsButtons.forEach((button, index) => {
            fireEvent.click(button);
            expect(mockedUsedNavigate).toHaveBeenLastCalledWith(`/product/${productCategory[index].slug}`);
          });
        });
      };

      cleanup();
    }
  });
});
