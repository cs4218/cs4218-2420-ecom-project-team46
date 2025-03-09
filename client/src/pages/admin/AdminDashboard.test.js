import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";
import '@testing-library/jest-dom/extend-expect';

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

const admin = {
  name: "Admin123",
  email: "admin123@example.com",
  phone: "1112223334"
}

describe("AdminDashboard", () => {
  test("should render admin details correctly", async () => {
    useAuth.mockReturnValue([{ user: admin }]);

    render(    
    <MemoryRouter initialEntries={[`/dashboard/admin`]}>
      <Routes>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: /Admin123/ })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("heading", { name: /admin123@example.com/ })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole("heading", { name: /1112223334/ })).toBeInTheDocument());
  });
});