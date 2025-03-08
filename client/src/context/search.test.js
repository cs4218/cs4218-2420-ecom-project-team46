import { cleanup, renderHook, act, waitFor } from "@testing-library/react";
import { SearchProvider, useSearch } from "./search";

beforeAll(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  cleanup();
});

describe("SearchContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should provide search state via SearchProvider", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    
    expect(result.current[0]).toEqual({ keyword: "", results: [] });
    expect(typeof result.current[1]).toBe("function");
  });

  it("should update search state with setSearch", async () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    
    act(() => {
      result.current[1]({ keyword: "test", results: ["result1", "result2"] });
    });
    
    await waitFor(() => {
      expect(result.current[0]).toEqual({ keyword: "test", results: ["result1", "result2"] });
    });
  });

  it("should update search state with repeated calls to setSearch", async () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    
    act(() => {
      result.current[1]({ keyword: "first", results: ["firstResult"] });
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual({ keyword: "first", results: ["firstResult"] });
    });
    
    act(() => {
      result.current[1]({ keyword: "second", results: ["secondResult", "anotherResult"] });
    });
    await waitFor(() => {
      expect(result.current[0]).toEqual({ keyword: "second", results: ["secondResult", "anotherResult"] });
    });
  });
});
