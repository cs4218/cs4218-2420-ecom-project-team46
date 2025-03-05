import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Contact from "./Contact";

jest.mock("../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("Contact page", () => {
  beforeEach(() => {
    render(<Contact />);
  });

  it("should display an image with src matching 'contactus'", () => {
    const image = screen.getByRole("img", { name: /contactus/i });
    expect(image).toBeInTheDocument();
    expect(image.src).toMatch(/contactus/i);
  });

  it("should display a header with text matching 'contact us'", () => {
    const heading = screen.getByRole("heading", { name: /contact us/i });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/contact us/i);
  });

  it("should display the corresponding icon to each contact information", () => {
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
    expect(screen.getByTestId("support-icon")).toBeInTheDocument();
  });

  it("should display the corresponding contact information to each icon", () => {
    expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/)).toBeInTheDocument();
    expect(
      screen.getByText(/1800-0000-0000 \(toll free\)/i)
    ).toBeInTheDocument();
  });
});
