import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";
import '@testing-library/jest-dom/extend-expect';

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const user = {
  name: "user123",
  email: "user@testing.com",
  phone: "123423453456",
  address: "bukitpanjang"
};

describe("UserDashboard", () => {
  test("should render user details correctly", async () => {
    useAuth.mockReturnValue([{ user: user }]);

    render(    
    <MemoryRouter initialEntries={[`/dashboard/user`]}>
      <Routes>
        <Route path="/dashboard/user" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: /user123/ })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("heading", { name: /user@testing.com/ })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("heading", { name: /bukitpanjang/ })).toBeInTheDocument());
  });
});
