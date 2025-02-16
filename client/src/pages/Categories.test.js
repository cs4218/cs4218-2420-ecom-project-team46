import React from "react";
import { screen, render, cleanup} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
}));

jest.mock("../components/Layout", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock("../hooks/useCategory");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: jest.fn(({ to, children }) => <a href={to}>{children}</a>),
}));

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

const categories = [
  {
    "_id": "67ac52a0386736ef463c876d",
    "name": "Category 1",
    "slug": "category-1"
  },
  {
    "_id": "67ac52b9cbd13114f6acea9f",
    "name": "Category 2",
    "slug": "category-2"
  },
  {
    "_id": "67ac53bc656986b34cc98dc4",
    "name": "Category 3",
    "slug": "category-3"
  }
];

describe("Categories Component", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render all categories as links", async () => {
    useCategory.mockReturnValue([...categories]);
    
    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    // Check that the links to the categories are rendered
    for (let i = 0; i < categories.length; i += 1 ) {
      const categoryElement = await screen.findByText(categories[i].name, { exact: true });
      expect(categoryElement).toBeInTheDocument();
      const link = screen.getByRole("link", { name: categories[i].name });
      expect(link).toHaveAttribute("href", `/category/${categories[i].slug}`);
    }
  });

  it('should display nothing if no categories are available', () => {
    useCategory.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={["/categories"]}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </MemoryRouter>
    );

    const allLinks = screen.queryAllByRole("link");

    allLinks.forEach((link) => {
      expect(link).not.toHaveAttribute("href", expect.stringContaining("/category/"));
    });
  });

});
