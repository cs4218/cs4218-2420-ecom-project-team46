import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import AdminMenu from "./AdminMenu";

describe("AdminMenu Component", () => {
  test("renders Admin Panel heading", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );
    const headingElement = screen.getByRole("heading", { name: /Admin Panel/i })
    expect(headingElement).toBeInTheDocument();
  });

  test("renders Create Category link", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Create Category/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/admin/create-category");
  });

  test("renders Create Product link", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Create Product/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/admin/create-product");
  });

  test("renders Products link", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Products/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/admin/products");
  });

  test("renders Orders link", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Orders/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/admin/orders");
  });

  test("renders Users link", () => {
    render(
      <Router>
        <AdminMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Users/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/admin/users");
  });
});