// The test file does not use JSX, so React is not required.
// React is only needed inside auth.js where JSX (<AuthContext.Provider>) is used.
// Jest doesn’t require React unless testing components with JSX.
// import React from "react";
import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

jest.mock("axios");

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete axios.defaults.headers.common["Authorization"];
  });

  afterEach(() => {
    cleanup();
  });

  it("should provide authentication state via AuthProvider", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current[0]).toEqual({ user: null, token: "" });
    expect(typeof result.current[1]).toBe("function"); // setAuth should be a function
  });

  it("should retrieve auth from localStorage on mount", async () => {
    const storedAuth = JSON.stringify({ user: { name: "Alice" }, token: "xyz123" });
    window.localStorage.getItem.mockReturnValue(storedAuth);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ user: { name: "Alice" }, token: "xyz123" });
    });
  });

  it("should update auth state with setAuth", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current[1]({ user: { name: "Bob" }, token: "abc456" });
    });

    expect(result.current[0]).toEqual({ user: { name: "Bob" }, token: "abc456" });
  });

  it("should update axios Authorization header when token changes", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current[1]({ user: { name: "Charlie" }, token: "jwt789" });
    });
    await waitFor(() => {
      expect(axios.defaults.headers.common["Authorization"]).toBe("jwt789");
    });
  });

  it("should not set Authorization header when token is empty", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    act(() => {
      result.current[1]({ user: null, token: "" });
    });
    
    await waitFor(() => {
      expect(axios.defaults.headers.common.hasOwnProperty("Authorization")).toBe(false);
    });
  });
});
