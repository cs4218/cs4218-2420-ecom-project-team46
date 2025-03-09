import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

// Mock the bcrypt module
jest.mock("bcrypt");

describe("hashPassword", () => {
  it("should return the hashed password on success", async () => {
    const fakeHashedPassword = "fakeHashedPassword";
    // When calling bcrypt.hash, resolve with fakeHashedPassword
    bcrypt.hash.mockResolvedValue(fakeHashedPassword);

    const password = "testPassword";
    const result = await hashPassword(password);

    // Verify bcrypt.hash is called with the correct password and a number for salt rounds.
    expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
    expect(result).toBe(fakeHashedPassword);
  });

  it("should return undefined when bcrypt.hash fails", async () => {
    const error = new Error("hash failed");
    bcrypt.hash.mockRejectedValue(error);

    const result = await hashPassword("testPassword");

    // Expect result to be undefined because the error is caught.
    expect(result).toBeUndefined();

    // logging is not part of the function's core functionality (and is more for debugging)
  });
});

describe("comparePassword", () => {
  it("should return true when passwords match", async () => {
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword("testPassword", "fakeHashedPassword");

    expect(bcrypt.compare).toHaveBeenCalledWith("testPassword", "fakeHashedPassword");
    expect(result).toBe(true);
  });

  it("should return false when passwords do not match", async () => {
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword("testPassword", "fakeHashedPassword");

    expect(result).toBe(false);
  });

  it("should return undefined when bcrypt.compare fails", async () => {
    const error = new Error("compare failed");
    bcrypt.compare.mockRejectedValue(error);

    const result = await comparePassword("testPassword", "fakeHashedPassword");

    // Since the error is caught, expect undefined to be returned.
    expect(result).toBeUndefined();
  });
});
