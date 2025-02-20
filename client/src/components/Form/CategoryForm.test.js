import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CategoryForm from "./CategoryForm";
import "@testing-library/jest-dom/extend-expect";

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("CategoryForm Component", () => {
    
  beforeEach(() => {
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      cleanup();
    });
  
  it("should render input field and submit button", async() => {
    
    render(<CategoryForm handleSubmit={jest.fn()} value="" setValue={jest.fn()} />);

    const inputField = screen.getByPlaceholderText("Enter new category");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    expect(inputField).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("should call setValue on input change", async() => {
    
    const setValueMock = jest.fn();
    render(<CategoryForm handleSubmit={jest.fn()} value="" setValue={setValueMock} />);

    const inputField = screen.getByPlaceholderText("Enter new category");

    fireEvent.change(inputField, { target: { value: "New Category" } });

    expect(setValueMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("New Category");
  });

  it("should call handleSubmit on form submission", async() => {
    const handleSubmitMock = jest.fn();
    render(<CategoryForm handleSubmit={handleSubmitMock} value="Test" setValue={jest.fn()} />);

    const inputField = screen.getByPlaceholderText("Enter new category");
    fireEvent.change(inputField, { target: { value: "New Category" } });

    const searchButton = screen.getByRole("button");
    fireEvent.submit(searchButton);

    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
  });

});