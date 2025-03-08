import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import UserMenu from "./UserMenu";

describe("UserMenu Component", () => {
  test("renders Dashboard heading", () => {
    render(
      <Router>
        <UserMenu />
      </Router>
    );
    const headingElement = screen.getByRole("heading", { name: /Dashboard/i })
    expect(headingElement).toBeInTheDocument();
  });

  test("renders Profile link", () => {
    render(
      <Router>
        <UserMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Profile/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/user/profile");
  });

  test("renders Orders link", () => {
    render(
      <Router>
        <UserMenu />
      </Router>
    );

    const linkElement = screen.getByRole("link", { name: /Orders/i })
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.getAttribute("href")).toBe("/dashboard/user/orders");
  });
});