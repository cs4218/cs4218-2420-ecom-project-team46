import { cleanup, renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";
import axios from "axios";

// Mock axios
jest.mock("axios");

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("useCategory hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Test initial state: Ensure that before useEffect runs, the hook returns an empty array.
  it("should have initial state as an empty array", () => {
    const { result } = renderHook(() => useCategory());
    // Immediately accessing the returned value; at this point, useEffect has not triggered the async request.
    expect(result.current).toEqual([]);
  });

  // Test successful data fetching: After a successful API call, state updates to the expected categories.
  it("should fetch and set categories successfully", async () => {
    const mockCategories = ["Category1", "Category2"];
    axios.get.mockResolvedValueOnce({ 
      data: { 
        success: true, 
        category: mockCategories 
      } 
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
    });
  });

  // Test unsuccessful data fetching: After an unsuccessful API call, state updates to [].
  it("should set categories to an empty array when API response indicates failure", async () => {
    // Simulate a response where success is explicitly false
    axios.get.mockResolvedValueOnce({ 
      data: {
        success: false, 
        category: ["ShouldNotAppear"] 
      } 
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });  

  // Test error handling: When the API call fails, the state remains an empty array.
  it("should handle error when fetching categories", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useCategory());

    // Wait for the async request to finish (even if it fails)
    await waitFor(() => {
      // Since the request failed, the state should still be an empty array.
      expect(result.current).toEqual([]);
    });
  });

  // Test when the returned data structure is not as expected:
  // For example, if the API returns data without a 'category' field,
  // the hook will set the state to []
  it("should handle case when data does not contain 'category' field", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  // Test multiple mountings: Simulate unmounting and remounting the hook,
  // verifying that state updates correctly on each mount.
  it("should update state correctly on multiple mountings", async () => {
    // First mount returns a set of categories.
    const firstCategories = ["Cat1"];
    axios.get.mockResolvedValueOnce({ 
      data: { 
        success: true, 
        category: firstCategories 
      } 
    });
    const { result, unmount } = renderHook(() => useCategory());
    await waitFor(() => {
      expect(result.current).toEqual(firstCategories);
    });

    // Unmount the hook and then remount it, simulating a different set of categories.
    unmount();
    const secondCategories = ["Cat2", "Cat3"];
    axios.get.mockResolvedValueOnce({ 
      data: { 
        success: true, 
        category: secondCategories 
      } 
    });

    const { result: result2 } = renderHook(() => useCategory());
    await waitFor(() => {
      expect(result2.current).toEqual(secondCategories);
    });
  });
});
