import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Policy from "./Policy";

jest.mock("../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

describe("Policy page", () => {
  beforeEach(() => {
    render(<Policy />);
  });

  it("should display an image with src matching 'contactus'", () => {
    expect(screen.getByRole("img", { name: /contactus/i }).src).toMatch(
      /contactus/i
    );
  });
});
