import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, act, within } from "@testing-library/react";
import axios from "axios";
import path from "path";
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

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

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
  execSync("npm run db:reset", { stdio: "inherit" });
  axios.defaults.baseURL = "http://localhost:6060";
  window.localStorage.setItem("auth", JSON.stringify(loginState));
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

beforeEach(async () => {
  execSync("npm run db:reset", { stdio: "inherit" });
});

afterEach(() => {
  cleanup();
});

describe("CreateCategory Integration Tests", () => {

  it("should render the page correctly with essential components and show all categories", async () => {

    await act(async () => {
      render(
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
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

    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
    
    const categories = await categoryModel.find({});
    const main = screen.getByRole("main");

    for (let i = 0; i < categories.length; i += 1 ) {
      const categoryElement = await within(main).findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }
    expect(screen.getAllByText("Edit").length).toBe(categories.length);
    expect(screen.getAllByText("Delete").length).toBe(categories.length);
  });

  it("should create a new category and update the category list on successful form submission", async () => {

    await act(async () => {
      render(
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
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

    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/enter new category/i);

    await act(async () => {
      fireEvent.change(input, { target: { value: "Furniture" } });
      fireEvent.click(screen.getByText("Submit"));
    });

    const main = screen.getByRole("main");
    const categoryElement = await within(main).findByText("Furniture", { exact: true });
    expect(categoryElement).toBeInTheDocument();

  });

  it("should update an existing category and refresh the list on successful edit form submission", async () => {

    await act(async () => {
      render(
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
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

    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const category = await categoryModel.findOne({});
    const main = screen.getByRole("main");

    let editButton;
    await waitFor(async () => {
      const categoryRows = await within(main).findAllByRole("row");

      const categoryRow = categoryRows.find((row) => row.textContent.includes(category.name));
      editButton = within(categoryRow).getByRole("button", { name: /edit/i });
    });
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: "New Category" },
      });
      fireEvent.click(within(modal).getByText("Submit"));
    });

    const categoryElement = await within(main).findByText("New Category", { exact: true });
    expect(categoryElement).toBeInTheDocument();

    await waitFor(async () => {
      const categoryElement = within(main).queryByText(category.name, { exact: true });
      expect(main).not.toContainElement(categoryElement);
    });
  });

  it("should delete a category and refresh the list on successful delete button click", async () => {

    await act(async () => {
      render(
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
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

    await waitFor(() => {
      expect(screen.getByText("Manage Category")).toBeInTheDocument();
    });

    const category = await categoryModel.findOne({});
    const main = screen.getByRole("main");

    let deleteButton;
    await waitFor(async () => {
      const categoryRows = await within(main).findAllByRole("row");
      const categoryRow = categoryRows.find((row) => row.textContent.includes(category.name));
      deleteButton = within(categoryRow).getByRole("button", { name: /delete/i });
    });
    fireEvent.click(deleteButton);

    await waitFor(async () => {
      const categoryElement = within(main).queryByText(category.name, { exact: true });
      expect(main).not.toContainElement(categoryElement);
    });

  });

});
