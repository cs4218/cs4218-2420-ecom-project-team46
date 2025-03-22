import React from "react";
import { render, screen, fireEvent, act, cleanup, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import { execSync } from "child_process";
import axios from "axios";
import path from "path";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import App from "../App";

import dotenv from "dotenv";
import mongoose from "mongoose";
import productModel from "../../../models/productModel";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

beforeAll(async () => {
  execSync("npm run db:reset", { stdio: "inherit" });
  axios.defaults.baseURL = "http://localhost:6060";
  const mongoUri = process.env.MONGO_URL;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  axios.defaults.baseURL = undefined;
  await mongoose.disconnect();
  localStorage.clear();
  cleanup();
  execSync("npm run db:reset", { stdio: "inherit" });
});

beforeEach(() => {
  execSync("npm run db:reset", { stdio: "inherit" });
});

afterEach(() => {
  localStorage.clear();
  cleanup();
});

describe("Search Page Integration Tests", () => {

  it("should show all matching products found if search using an existing product keyword", async () => {

    await act(async () => {
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
    });

    // Flush pending updates that may not be immediately processed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const keyword =  "Phone";

    const search = screen.getByRole("search");
    const input = within(search).getByPlaceholderText(/search/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: keyword } });
      fireEvent.click(within(search).getByRole("button", { type: /submit/i }));
    });

    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
    });

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });

    const categoryElements = screen.getByRole("main").querySelectorAll(".card");
    expect(categoryElements.length).toBe(results.length);

    await waitFor(() => {
      expect(screen.getByText(`Found ${results.length}`)).toBeInTheDocument();
    });
  });

  it("should not show any products if search using a keyword not matching any products", async () => {

    await act(async () => {
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
    });

    // Flush pending updates that may not be immediately processed
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const keyword =  "nonexistentproductkeyword";

    const search = screen.getByRole("search");
    const input = within(search).getByPlaceholderText(/search/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: keyword } });
      fireEvent.click(within(search).getByRole("button", { type: /submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });

    const categoryElements = screen.getByRole("main").querySelectorAll(".card");
    expect(categoryElements.length).toBe(0);

    await waitFor(() => {
      expect(screen.getByText(`No Products Found`)).toBeInTheDocument();
    });
  });

  it("should add product to cart when 'ADD TO CART' button is clicked", async () => {

    await act(async () => {
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
    });

    const keyword =  "Phone";

    const search = screen.getByRole("search");
    const input = within(search).getByPlaceholderText(/search/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: keyword } });
      fireEvent.click(within(search).getByRole("button", { type: /submit/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("ADD TO CART"));
    });
    
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    expect(storedCart).toBeDefined();
    expect(storedCart.length).toBe(1);
    const regex = new RegExp(keyword, "i");
    expect(storedCart[0].name).toMatch(regex);
  });
});