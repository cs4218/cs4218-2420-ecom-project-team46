import { requireSignIn, isAdmin } from "./authMiddleware.js";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Mock external dependencies
jest.mock("jsonwebtoken");
jest.mock("../models/userModel.js");

describe("requireSignIn", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
    // Reset JWT.verify mock between tests
    JWT.verify.mockReset();
  });

  it("should return 401 if authorization header is missing", async () => {
    // No authorization header provided
    await requireSignIn(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1); // high-level check: send() is called once
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token validation fails", async () => {
    req.headers.authorization = "invalidtoken";
    // Simulate JWT.verify throwing an error (token validation fails)
    JWT.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });
    await requireSignIn(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1); // high-level check: send() is called once
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next if token is valid", async () => {
    req.headers.authorization = "validtoken";
    const decodedToken = { _id: "123", name: "Test User" };
    // Simulate successful token validation
    JWT.verify.mockReturnValue(decodedToken);
    await requireSignIn(req, res, next);
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("isAdmin", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: "123" } };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    next = jest.fn();
    // Reset userModel.findById mock between tests
    userModel.findById.mockReset();
  });

  it("should return 404 if user is not found", async () => {
    // Simulate user not found in the database
    userModel.findById.mockResolvedValue(null);
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1); // high-level check: send() is called once
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not admin", async () => {
    // Simulate a non-admin user (role != 1)
    const nonAdminUser = { _id: "123", role: 0 };
    userModel.findById.mockResolvedValue(nonAdminUser);
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1); // high-level check: send() is called once
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user is admin", async () => {
    // Simulate an admin user (role === 1)
    const adminUser = { _id: "123", role: 1 };
    userModel.findById.mockResolvedValue(adminUser);
    await isAdmin(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 500 if an error occurs during user lookup", async () => {
    // Simulate an error thrown during database query
    userModel.findById.mockImplementation(() => {
      throw new Error("Database Error");
    });
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1); // high-level check: send() is called once
    expect(next).not.toHaveBeenCalled();
  });
});
