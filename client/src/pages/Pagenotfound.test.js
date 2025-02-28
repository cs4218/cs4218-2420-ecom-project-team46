import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";

jest.mock("../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("Pagenotfound page", () => {
  beforeEach(() => {
    render(
      <Router>
        <Pagenotfound />
      </Router>
    );
  });

  it("should display a header with text matching '404'", () => {
    const heading = screen.getByRole("heading", { name: "404" });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/404/);
  });

  it("should display a header with text matching 'not found'", () => {
    const heading = screen.getByRole("heading", { name: /not found/i });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/not found/i);
  });

  it("should display a link with text matching 'back' and href attribute of '/'", () => {
    const link = screen.getByRole("link", { name: /back/i });
    expect(link).toBeInTheDocument();
    expect(link.textContent).toMatch(/back/i);
    expect(link).toHaveAttribute("href", "/");
  });
});
