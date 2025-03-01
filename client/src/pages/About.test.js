import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import About from "./About";

jest.mock("../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("About page", () => {
  beforeEach(() => {
    render(<About />);
  });

  it("should display an image with src matching 'about'", () => {
    expect(screen.getByRole("img", { name: /contactus/i }).src).toMatch(
      /about/i
    );
  });
});
