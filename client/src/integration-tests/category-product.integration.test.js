import React from "react";
import axios from "axios";
import path from "path";
import { render, screen, cleanup, waitFor, within, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import { execSync } from "child_process";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import { CartProvider } from "../context/cart";
import App from "../App";

import dotenv from "dotenv";
import mongoose from "mongoose";
import categoryModel from "../../../models/categoryModel";
import productModel from "../../../models/productModel";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

beforeAll(async () => {
  execSync("npm run db:reset", { stdio: "inherit" });
  axios.defaults.baseURL = "http://localhost:6060";
  const mongoUri = process.env.MONGO_URL;
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  window.localStorage.removeItem("auth");
  axios.defaults.baseURL = undefined;
  await mongoose.disconnect();
  cleanup();
  execSync("npm run db:reset", { stdio: "inherit" });
});

beforeEach(() => {
  execSync("npm run db:reset", { stdio: "inherit" });
});

afterEach(() => {
  cleanup();
});

describe("Categories Page Integration Tests", () => {
  it("should render all categories with the correct links", async () => {
    
    const categories = await categoryModel.find({});

    await act(async () => {
      render(
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <MemoryRouter initialEntries={[`/categories`]}>
              <App />
            </MemoryRouter>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
      );
    });
    
    await waitFor(() => {
      const main = screen.getByRole("main");
      const links = within(main).getAllByRole("link");
      expect(links.length).toBe(categories.length);
  
      categories.forEach((category) => {
        const matchingLink = links.find((link) => link.textContent.trim() === category.name);
        expect(matchingLink).toBeDefined();
      });
    });

    cleanup();
  });
});


describe("CategoryProduct Page Integration Tests", () => {

  it("should return all products under category for each category", async () => {

    const categories = await categoryModel.find({});

    for (let i = 0; i < categories.length; i += 1 ) {

      const category = categories[i];
      const productCategory = await productModel.find({ category }).populate("category");

      await act(async () => {
        render(
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={[`/category/${category.slug}`]}>
                <App />
              </MemoryRouter>
            </CartProvider>
          </SearchProvider>
        </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByText(`Category - ${category.name}`)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(`${productCategory.length} result found`)).toBeInTheDocument();
      });

      const categoryElements = screen.getByRole("main").querySelectorAll(".card");
      expect(categoryElements.length).toBe(productCategory.length);

      productCategory.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });

      cleanup();
    };
  });
});