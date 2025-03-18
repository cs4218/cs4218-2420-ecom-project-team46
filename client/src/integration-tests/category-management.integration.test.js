import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, act, within } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from "../pages/admin/CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CreateCategory Page Integration", () => {

  it("should call API on mount and display categories on mount when API returns success", async () => {
    const categories = [{ _id: "1", name: "Electronics" }];

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: categories },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    expect(await screen.findByText("Electronics")).toBeInTheDocument();
  });

  it("should call API on mount and display toast error when API indicates failure", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: false, message: "MockMessage" },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("MockMessage"));
  });

  it("should call API on mount and display toast error when an exception occurs during API call", async () => {
    axios.get.mockRejectedValueOnce({
      data: { success: false, error: "mockError", message: "mockMessage" },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category"));
  });

  it("should call API to create a new category and updates the category list on successful form submission", async () => {
    const newCategories = [{ _id: "2", name: "Books" }];
    
    axios.get.mockResolvedValueOnce({ data: { success: true } })
      .mockResolvedValueOnce({
        data: { success: true, category: newCategories }
      });
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const input = screen.getByPlaceholderText(/enter new category/i);
    fireEvent.change(input, { target: { value: "Books" } });
    
    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        { name: "Books" }
      )
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Books is created")
    );
    expect(await screen.findByText("Books")).toBeInTheDocument();
  });

  it("should call API and display toast error when new category creation returns a failure message", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true } });
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "MockMessage"
      }
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const input = screen.getByPlaceholderText(/enter new category/i);
    fireEvent.change(input, { target: { value: "Books" } });
    
    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        { name: "Books" }
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("MockMessage")
    );
    const ele = screen.queryByText("Books", { exact: true });
    expect(ele).not.toBeInTheDocument();
  });

  it("should call API and display toast error when an exception occurs during new category creation", async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true } });
    axios.post.mockRejectedValueOnce(new Error("mockError"));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const input = screen.getByPlaceholderText(/enter new category/i);
    fireEvent.change(input, { target: { value: "Books" } });
    
    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        { name: "Books" }
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form")
    );
    const ele = screen.queryByText("Books", { exact: true });
    expect(ele).not.toBeInTheDocument();
  });

  it("should call API to update an existing category and refresh the list on successful edit form submission", async () => {
    const categories = [{ _id: "3", name: "Clothing" }];
    const updatedCategories = [{ _id: "3", name: "Apparel" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } })
      .mockResolvedValueOnce({ data: { success: true, category: updatedCategories } });
    axios.put.mockResolvedValueOnce({
      data: { success: true, category: { _id: "3", name: "Apparel" } },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Clothing"));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: "Apparel" },
      });
      fireEvent.click(within(modal).getByText("Submit"));
    });
    
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/3",
        { name: "Apparel" }
      )
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Apparel is updated")
    );
    expect(await screen.findByText("Apparel")).toBeInTheDocument();
  });

  it("should call API and display toast error when API returns failure for category update", async () => {
    const categories = [{ _id: "3", name: "Clothing" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.put.mockResolvedValueOnce({
      data: { success: false, message: "MockMessage" },
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Clothing"));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: "Apparel" },
      });
      fireEvent.click(within(modal).getByText("Submit"));
    });
    
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/3",
        { name: "Apparel" }
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("MockMessage")
    );
    expect(await screen.findByText("Clothing")).toBeInTheDocument();
    expect(screen.queryByText("Apparel", { exact: true })).not.toBeInTheDocument();
  });

  it("should call API and display toast error when an exception occurs during category update", async () => {
    const categories = [{ _id: "3", name: "Clothing" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.put.mockRejectedValueOnce(new Error("mockError"));

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Clothing"));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: "Apparel" },
      });
      fireEvent.click(within(modal).getByText("Submit"));
    });
    
    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/3",
        { name: "Apparel" }
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    );
    expect(await screen.findByText("Clothing")).toBeInTheDocument();
    expect(screen.queryByText("Apparel", { exact: true })).not.toBeInTheDocument();
  });

  it("should call API to deletes a category and refresh the list on successful delete button click", async () => {
    const categories = [{ _id: "4", name: "Furniture" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } })
      .mockResolvedValueOnce({ data: { success: true, category: [] } });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });
  
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Furniture"));
    const deleteButton = within(categoryRow).getByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/4"
      )
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Category is deleted")
    );

    const ele = screen.queryByText("Furniture", { exact: true });
    expect(ele).not.toBeInTheDocument();
  });

  it("should call API and display toast error when API returns failure for category deletion", async () => {
    const categories = [{ _id: "4", name: "Furniture" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.delete.mockResolvedValueOnce({ data: { success: false, message: "MockMessage" } });
  
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Furniture"));
    const deleteButton = within(categoryRow).getByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/4"
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("MockMessage")
    );
    expect(screen.getByText("Furniture")).toBeInTheDocument();
  });

  it("should call API and display toast error when an exception occurs during category deletion", async () => {
    const categories = [{ _id: "4", name: "Furniture" }];

    axios.get.mockResolvedValueOnce({ data: { success: true, category: categories } });
    axios.delete.mockRejectedValueOnce(new Error("mockError"));
  
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/create-category"]}>
          <Routes>
            <Route path="/create-category" element={<CreateCategory />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes("Furniture"));
    const deleteButton = within(categoryRow).getByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    fireEvent.click(deleteButton);
    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/4"
      )
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    );
    expect(screen.getByText("Furniture")).toBeInTheDocument();
  });

});
