import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Spinner from "./Spinner";

const mockedUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUseNavigate,
}));

describe("Spinner", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseNavigate.mockClear();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const renderSpinnerComponent = (path) => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        {path ? <Spinner path={path} /> : <Spinner />}
      </MemoryRouter>
    );
  };

  it("should display spinner component and loading status text", () => {
    renderSpinnerComponent();

    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should count down and navigate to path prop after 3 seconds", () => {
    const path = faker.system.directoryPath().slice(1);
    renderSpinnerComponent(path);

    expect(screen.getByText(/3/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/2/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/1/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/${path}`, {
      state: { from: "/dashboard" },
    });
  });

  it("should count down and navigate to default /login path after 3 seconds if no path prop is provided", () => {
    renderSpinnerComponent();

    expect(screen.getByText(/3/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/2/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/1/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockedUseNavigate).toHaveBeenCalledWith("/login", {
      state: { from: "/dashboard" },
    });
  });
});
