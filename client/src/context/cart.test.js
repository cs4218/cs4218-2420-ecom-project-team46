import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

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

describe("CartContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("should provide default cart state via CartProvider", () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

    expect(result.current[0]).toEqual([]);
    expect(typeof result.current[1]).toBe("function");
  });

  it("should retrieve cart from localStorage on mount if valid", async () => {
    const storedCart = JSON.stringify([{ id: 1, name: "Test Product" }]);
    window.localStorage.getItem.mockReturnValue(storedCart);

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => {
      expect(result.current[0]).toEqual([{ id: 1, name: "Test Product" }]);
    });
  });

  it("should remain in default state if localStorage returns null", async () => {
    window.localStorage.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });
  });
  
  it("should handle invalid JSON in localStorage gracefully", async () => {
    window.localStorage.getItem.mockReturnValue("invalid json");

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });
  });

  it("should update cart state using setCart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current[1]([{ id: 2, name: "Another Product" }]);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual([{ id: 2, name: "Another Product" }]);
    });
  });

  it("should update cart state with repeated calls to setCart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => {
      result.current[1]([{ id: 1, name: "Product 1" }]);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual([{ id: 1, name: "Product 1" }]);
    });

    act(() => {
      result.current[1]([{ id: 1, name: "Product 1" }, { id: 2, name: "Product 2" }]);
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual([{ id: 1, name: "Product 1" }, { id: 2, name: "Product 2" }]);
    });
  });
});
