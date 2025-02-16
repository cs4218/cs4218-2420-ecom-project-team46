import React from "react";
import { screen, render, fireEvent, waitFor, within, cleanup, act } from "@testing-library/react";
import toast from "react-hot-toast";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from "./CreateCategory";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), 
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), 
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("../../components/AdminMenu", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Admin Menu</div>),
}));

jest.mock("../../components/Form/CategoryForm", () => ({
  __esModule: true,
  default: ({ handleSubmit, value, setValue }) => (
    <div data-testid="mock-category-form">
      <input
        type="text"
        placeholder="Enter new category"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button data-testid="category-submit" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  ),
}));

jest.mock("antd", () => ({
  __esModule: true,
  Modal: ({ open, onCancel, children }) =>
    open ? (
      <div role="dialog" data-testid="mock-modal">
        <button aria-label="Close" onClick={onCancel}>Close</button>
        {children}
      </div>
    ) : null,
}));

const categories = [
    {
      "_id": "67ac53d78c0325098b6f7db2",
      "name": "Category 1",
      "slug": "category-1"
    },
    {
      "_id": "67ac53dd33c16bbf1e2de38a",
      "name": "Category 2",
      "slug": "category-2"
    },
    {
      "_id": "67ac53e3a77df78f1be8e36f",
      "name": "Category 3",
      "slug": "category-3"
    }
  ];

const updatedCategories = [
    {
      "_id": "67ac53d78c0325098b6f7db2",
      "name": "Category 1 Updated",
      "slug": "category-1-updated"
    },
    {
      "_id": "67ac53dd33c16bbf1e2de38a",
      "name": "Category 2",
      "slug": "category-2"
    },
    {
      "_id": "67ac53e3a77df78f1be8e36f",
      "name": "Category 3",
      "slug": "category-3"
    }
  ];

const newCategory = {
      "_id": "67ac53fa5573ab35d2a4c9fd",
      "name": "Category 4",
      "slug": "category-4"
  };

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("Category Fetching and Rendering", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
  
  it("should render page with essential components when no categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: []
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText("Manage Category")).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it("should render page with essential components when categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText("Manage Category")).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it("should render CategoryForm component for creating a new category when no categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: []
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("should render CategoryForm component for creating a new category when categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("category creation input should be initially empty when no categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: []
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

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("Enter new category").value).toBe("");
  });

  it("category creation input should be initially empty when categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByPlaceholderText("Enter new category").value).toBe("");
  });

  it("should render table with headers when no categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: []
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should render the table with headers containing list of categories when categories present", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    
    for (let i = 0; i < categories.length; i += 1 ) {
      const categoryElement = await screen.findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }
  });

  it("should render Edit and Delete buttons for each category in table", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    for (let i = 0; i < categories.length; i += 1 ) {
      const categoryElement = await screen.findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }
    expect(screen.getAllByText("Edit").length).toBe(categories.length);
    expect(screen.getAllByText("Delete").length).toBe(categories.length);
  });

  it("should handle error when cannot get category list", async () => {
    axios.get.mockRejectedValueOnce({
        data: {
          success: false,
          error: "mockError",
          message: "mockMessage"
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
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");

    // no records wll be returned
    expect(screen.getByText("Manage Category")).toBeInTheDocument();
    const categoryRows = screen.queryAllByRole("row");
    expect(categoryRows.length).toBe(1);
  });

});


describe("Category Creation", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should show a success toast message when the category is created successfully", async() => {
    
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: [...categories, {...newCategory}]
      }
    });
    
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: newCategory
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

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: newCategory.name},
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(`${newCategory.name} is created`));
  });

  it("should reflect updated categories with Edit and Delete buttons after successful creation", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: [...categories, newCategory]
      }
    });
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: newCategory
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

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: newCategory.name},
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    // Wait for the success toast and category list update
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(`${newCategory.name} is created`));

    const categoryElement = await screen.findByText(`${newCategory.name}`, { exact: true });
    expect(categoryElement).toBeInTheDocument();

    for (let i = 0; i < categories.length; i += 1 ) {
      const categoryElement = await screen.findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }

    expect(screen.getAllByText("Edit").length).toBe(categories.length + 1);
    expect(screen.getAllByText("Delete").length).toBe(categories.length + 1);
  });

  it("should show error toast message when category creation fails", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "mockFailureMessage"
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

    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: newCategory.name},
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("mockFailureMessage"));
  });

  it("should show error toast message when category creation has error", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
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
    
    fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
      target: { value: newCategory.name},
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form"));
  });
});

describe("Category Update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

    it("should open modal with category name when Edit button is clicked", async() => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "mockMessage",
          category: categories
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

      const originalName = categories[0].name;

      const categoryRows = await screen.findAllByRole("row");
      const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
      const editButton = within(categoryRow).getByText("Edit");
      
      fireEvent.click(editButton);

      const modal = await screen.findByRole('dialog');
      const placeholderField = within(modal).getByPlaceholderText("Enter new category");

      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      expect(placeholderField.value).toBe(originalName);
  });

  it("should close modal when cancel button is clicked", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
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

    const originalName = categories[0].name;

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');

    const cancelButton = screen.getByLabelText('Close');
    
    fireEvent.click(cancelButton);
    
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(modal).not.toBeVisible();
});

  it("should update the category name when the form inside the modal is submitted", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories
      }
    });
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories[0]
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: updatedName},
      });

      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    
    const categoryElement2 = await screen.findByText(updatedName, { exact: true });
    expect(categoryElement2).toBeInTheDocument();

    const categoryElement3 = screen.queryByText(originalName, { exact: true });
    expect(categoryElement3).not.toBeInTheDocument();

  });

  it("should update the category list when the form inside the modal is submitted", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories
      }
    });
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories[0]
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: updatedName},
      });

      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    
    for (let i = 0; i < updatedCategories.length; i += 1 ) {
      const categoryElement = await screen.findByText(updatedCategories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }

    expect(screen.getAllByText("Edit").length).toBe(updatedCategories.length);
    expect(screen.getAllByText("Delete").length).toBe(updatedCategories.length);
  });

  it("should show success toast when category is updated successfully", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories
      }
    });
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories[0]
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    await act(async () => {
      fireEvent.change(placeholderField, {
        target: { value: updatedName},
      });

      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(`${updatedName} is updated`));
  });

  it("should show error toast when category update fails", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
    axios.put.mockResolvedValueOnce({
      data: {
        success: false,
        message: "mockFailure",
        error: "mockError"
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryElement = await screen.findByText(originalName, { exact: true });
    expect(categoryElement).toBeInTheDocument();

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    fireEvent.change(placeholderField, {
      target: { value: updatedName},
    });

    await act(async () => {
      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("mockFailure"));
  });

  it("should show error toast when category update has error", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryElement = await screen.findByText(originalName, { exact: true });
    expect(categoryElement).toBeInTheDocument();

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    fireEvent.change(placeholderField, {
      target: { value: updatedName},
    });

    await act(async () => {
      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
  });

  it("should close the modal after the category is updated", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories
      }
    });
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: updatedCategories[0]
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

    const originalName = categories[0].name;
    const updatedName = updatedCategories[0].name;

    const categoryRows = await screen.findAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const editButton = within(categoryRow).getByText("Edit");
    
    fireEvent.click(editButton);

    const modal = await screen.findByRole('dialog');
    const placeholderField = within(modal).getByPlaceholderText("Enter new category");
    
    fireEvent.change(placeholderField, {
      target: { value: updatedName},
    });

    await act(async () => {
      fireEvent.click(within(modal).getByText("Submit"));
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    
    expect(modal).not.toBeVisible();
  });
});


describe("Category Deletion", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  afterEach(() => {
    cleanup();
    
  });

  it("should show success toast when category is deleted successfully", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories.slice(1)
      }
    });
    axios.delete.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage"
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

    const originalName = categories[0].name;

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const deleteButton = within(categoryRow).getByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Category is deleted"));
  });

  it("should delete category when Delete button is clicked", async() => {

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories.slice(1)
      }
    });
    axios.delete.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage"
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

    const originalName = categories[0].name;

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const deleteButton = within(categoryRow).getByText("Delete");
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Category is deleted"));

    const categoryElement2 = screen.queryByText(originalName, { exact: true });
    expect(categoryElement2).not.toBeInTheDocument();

  });

  it("should update the category list when Delete button is clicked", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    }).mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories.slice(1)
      }
    });
    axios.delete.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage"
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

    const originalName = categories[0].name;

    const categoryElement = await screen.findByText(originalName, { exact: true });
    expect(categoryElement).toBeInTheDocument();

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const deleteButton = within(categoryRow).getByText("Delete");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());

    for (let i = 1; i < categories.length; i += 1 ) {
      const categoryElement = await screen.findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
    }

    expect(screen.getAllByText("Edit").length).toBe(categories.length - 1);
    expect(screen.getAllByText("Delete").length).toBe(categories.length - 1);
  });

  it("should show error toast when deletion of category failed", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
    axios.delete.mockResolvedValueOnce({
      data: {
        success: false,
        message: "mockFailure",
        error: "mockError"
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

    const originalName = categories[0].name

    const categoryElement = await screen.findByText(originalName);
    expect(categoryElement).toBeInTheDocument();

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const deleteButton = within(categoryRow).getByText("Delete");
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("mockFailure"));
  });

  it("should show error toast when deletion of category has error", async() => {
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: "mockMessage",
        category: categories
      }
    });
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

    const originalName = categories[0].name

    const categoryElement = await screen.findByText(originalName);
    expect(categoryElement).toBeInTheDocument();

    const categoryRows = screen.getAllByRole("row");
    const categoryRow = categoryRows.find((row) => row.textContent.includes(originalName));
    const deleteButton = within(categoryRow).getByText("Delete");
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Wait for the success toast and category list update
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() => expect(axios.delete).toHaveBeenCalled());
    
    const categoryElement2 = await screen.findByText(originalName);
    expect(categoryElement2).toBeInTheDocument();
  });
});