import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel.js";
import authRoute from "../routes/authRoute.js";
import { hashPassword } from "../helpers/authHelper.js";

// In this integration test, we are testing the entire HTTP request flow—including the routing,
// middleware, and controller interactions—as they would work together in the real application.
// Additionally, these tests verify that the expected changes are persisted in the database.

let app;
let mongoServer;

beforeAll(async () => {
  // Set JWT secret for testing
  process.env.JWT_SECRET = "testsecret";

  // Start up in-memory DB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // Initialize Express app and mount auth-related routes
  app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRoute);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API Integration", () => {
  // Clean up database before each test
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a user with valid data and persist the user in the DB", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Main St",
          answer: "blue",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "john@example.com");

      // Verify in the database that the user was created
      const userInDb = await userModel.findOne({ email: "john@example.com" });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe("John Doe");
    });

    // unit tests already cover the detailed behavior (using test.each for each missing required field)
    // For integration tests, include one representative case that verifies a missing required field results in the expected 400 error.
    it("should not register a user if a required field is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          // missing name
          email: "john@example.com",
          password: "password123",
          phone: "1234567890",
          address: "123 Main St",
          answer: "blue",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Name is Required");

      // Verify that no user is created in the DB
      const userInDb = await userModel.findOne({ email: "john@example.com" });
      expect(userInDb).toBeNull();
    });

    it("should not register a user if the email is already registered", async () => {
      // Pre-create a user
      await userModel.create({
        name: "Existing User",
        email: "existing@example.com",
        password: await hashPassword("password123"),
        phone: "1234567890",
        address: "456 Main St",
        answer: "red",
      });

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "New User",
          email: "existing@example.com",
          password: "password123",
          phone: "0987654321",
          address: "789 Main St",
          answer: "blue",
        });
      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("message", "Already Register please login");

      // Verify that there is still only one user with that email in the DB
      const users = await userModel.find({ email: "existing@example.com" });
      expect(users.length).toBe(1);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Pre-create a user for login tests
      await userModel.create({
        name: "John Doe",
        email: "john@example.com",
        password: await hashPassword("password123"),
        phone: "1234567890",
        address: "123 Main St",
        answer: "blue",
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          password: "password123",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "john@example.com");
    });

    it("should fail login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          password: "wrongpassword",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    it("should fail login with missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          // missing password
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    beforeEach(async () => {
      // Pre-create a user for forgot-password tests
      await userModel.create({
        name: "John Doe",
        email: "john@example.com",
        password: await hashPassword("password123"),
        phone: "1234567890",
        address: "123 Main St",
        answer: "blue",
      });
    });

    it("should reset password with valid email, answer, and new password, and update the DB", async () => {
      // Get the user before password reset
      const userBefore = await userModel.findOne({ email: "john@example.com" });
      const oldPasswordHash = userBefore.password;

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "blue",
          newPassword: "newpassword456",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Password Reset Successfully");

      // Verify in the DB that the password hash has been updated
      const userAfter = await userModel.findOne({ email: "john@example.com" });
      expect(userAfter.password).not.toEqual(oldPasswordHash);

      // Verify that the user can now login with the new password
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "john@example.com",
          password: "newpassword456",
        });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty("token");
    });

    it("should not reset password with wrong answer", async () => {
      // Get the current password hash
      const userBefore = await userModel.findOne({ email: "john@example.com" });
      const oldPasswordHash = userBefore.password;

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "wrongAnswer",
          newPassword: "newpassword456",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Wrong Email Or Answer");

      // Verify in the DB that the password hash has not changed
      const userAfter = await userModel.findOne({ email: "john@example.com" });
      expect(userAfter.password).toEqual(oldPasswordHash);
    });

    it("should not reset password if required fields are missing", async () => {
      // Get the current password hash
      const userBefore = await userModel.findOne({ email: "john@example.com" });
      const oldPasswordHash = userBefore.password;
  
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "blue",
          // missing newPassword
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "New Password is required");
  
      // Verify in the DB that the password hash has not changed
      const userAfter = await userModel.findOne({ email: "john@example.com" });
      expect(userAfter.password).toEqual(oldPasswordHash);
    });
  });
});