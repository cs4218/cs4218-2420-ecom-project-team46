import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import "./index.css";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import "antd/dist/reset.css";
import { execSync } from "child_process";
import "@testing-library/jest-dom";
import App from "../App";

// same credentials as used for the Playwright testing (in playwright-storage/admin.json), just for convenience
const loginState = {
  success: true,
  message: "login successfully",
  user: {
    _id: "67d409012b398f2f72b42b03",
    name: "Playwright Admin Account",
    email: "cs4218admin@test.com",
    phone: "81234567",
    address: "1 Computing Drive",
    role: 1,
  },
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2Q0MDkwMTJiMzk4ZjJmNzJiNDJiMDMiLCJpYXQiOjE3NDIzOTM3MDIsImV4cCI6MTc0Mjk5ODUwMn0.puK4-yaa7AePBtniVaXHZLa3sjb2e-lj0GjGNbXzJ4A",
};

beforeAll(async () => {
  // has to mock as jest jsdom does not implement this (see https://github.com/jsdom/jsdom/blob/b83783da63deeb7c5602b024a92e214df423a412/lib/jsdom/browser/Window.js#L619)
  window.prompt = jest.fn().mockReturnValue("Yes");
  // unfortunately we need to mock these because of the media queries, couldn't find an easier way around it
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
  // set the login credentials so we can access admin pages easily
  window.localStorage.setItem("auth", JSON.stringify(loginState));
  axios.defaults.baseURL = "http://localhost:6060";
});

afterAll(async () => {
  window.localStorage.removeItem("auth");
  axios.defaults.baseURL = undefined;
});

beforeEach(() => {
  // reset the db and populate with dummy/fresh data for every test
  execSync("npm run db:reset", { stdio: "inherit" });
});

const products = [
  { name: "Textbook", description: "A comprehensive textbook" },
  { name: "Laptop", description: "A powerful laptop" },
  { name: "Smartphone", description: "A high-end smartphone" },
  { name: "Novel", description: "A bestselling novel" },
  {
    name: "The Law of Contract in Singapore",
    description: "A bestselling book in Singapore",
  },
  { name: "NUS T-shirt", description: "Plain NUS T-shirt for sale" },
];

describe("Admin product integration tests", () => {
  test("/pages/admin/Products.js component correctly shows all products", async () => {
    // render the entire app as done in App.js, instead of individual components
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    await waitFor(() => screen.getByText(products[0].name));
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();
    });
  });
  test("/pages/admin/Products.js has working links to Update Product page and properly updates a product", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    // wait for the product link to appear
    await waitFor(() => screen.getByText(products[0].name));
    const productLink = screen.getByText(products[0].name).closest("a");
    fireEvent.click(productLink);

    //after clicking link, we should be on update product page
    await waitFor(() => screen.getByText("UPDATE PRODUCT"));
    expect(screen.getByText("UPDATE PRODUCT")).toBeInTheDocument();
    // wait for useEffect to populate the values of the inputs
    const nameInput = await screen.getByPlaceholderText("write a name");
    await waitFor(() => expect(nameInput).toHaveValue(products[0].name));

    // let's change products[0].name from Storybook to Fantasy Story
    fireEvent.change(nameInput, { target: { value: "Fantasy Story" } });
    const updateButton = screen.getByText("UPDATE PRODUCT");
    fireEvent.click(updateButton);

    // check that Producted Updated Successfully is toasted
    await waitFor(() => screen.getByText("All Products List"));
    expect(
      screen.getByText("Product Updated Successfully")
    ).toBeInTheDocument();

    // check that the new product list has Fantasy Story
    await waitFor(() => screen.getByText("Fantasy Story"));
  });
  test("/pages/admin/Products.js has working links to Update Product page and properly deletes a product", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    // wait for the product link to appear
    await waitFor(() => screen.getByText(products[0].name));
    const productLink = screen.getByText(products[0].name).closest("a");
    fireEvent.click(productLink);

    //after clicking link, we should be on update (/delete) product page
    await waitFor(() => screen.getByText("DELETE PRODUCT"));
    expect(screen.getByText("DELETE PRODUCT")).toBeInTheDocument();
    const deleteButton = screen.getByText("DELETE PRODUCT");

    // make sure the form is populated with default values
    await waitFor(() =>
      expect(screen.getByPlaceholderText("write a name")).toHaveValue(
        products[0].name
      )
    );

    // delete products[0]
    fireEvent.click(deleteButton);
    await waitFor(() => screen.getByText("All Products List"));

    // check toast
    expect(
      screen.getByText("Product Deleted Successfully")
    ).toBeInTheDocument();

    // check that the new product list has loaded
    await waitFor(() => screen.getByText(products[1].name));
    expect(screen.queryByText(products[0].name)).not.toBeInTheDocument();
  });
});

describe("User product integration tests", () => {
  test("homepage should show all the products", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/"]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );

    await waitFor(() => screen.getAllByText("More Details"));
    products.forEach(async (product) => {
      await expect(screen.getByText(product.name)).toBeInTheDocument();
      await expect(
        screen.getByText(product.description.substring(0, 60) + "...")
      ).toBeInTheDocument();
    });
  });
  test("More details button from homepage should link to Product Details page", async () => {
    render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={["/"]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    );
    // wait for the product link to appear
    await waitFor(() => screen.getAllByText("More Details"));
    const productLink = screen.getAllByText("More Details")[0];
    fireEvent.click(productLink);

    // ensure that the product details are visible
    await waitFor(() => screen.getByText("Product Details"));
    await waitFor(() => screen.getAllByText("ADD TO CART"));
    await waitFor(() => screen.getByText("Name : " + products[0].name));
    expect(screen.getByText("Name : " + products[0].name)).toBeInTheDocument();
  });
});
