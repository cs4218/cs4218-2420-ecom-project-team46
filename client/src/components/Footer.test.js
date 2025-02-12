import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Footer from "./Footer";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Footer", () => {
  const renderFooterComponent = () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Footer />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("should render Footer with heading matching 'all rights reserved'", () => {
    renderFooterComponent();

    expect(screen.getByRole("heading")).toHaveTextContent(
      /all rights reserved/i
    );
  });

  it("should render About link", () => {
    renderFooterComponent();

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
  });

  it("should render Contact link", () => {
    renderFooterComponent();

    const link = screen.getByRole("link", { name: "Contact" });
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("should render Privacy Policy link", () => {
    renderFooterComponent();

    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link).toHaveAttribute("href", "/policy");
  });
});
