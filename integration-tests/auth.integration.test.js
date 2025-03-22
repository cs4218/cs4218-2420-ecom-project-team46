import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel.js";
import authRoute from "../routes/authRoute.js";
import { hashPassword } from "../helpers/authHelper.js";

// in this integration test, I am testing the entire HTTP request flow—including the routing, middleware, and controller interactions—as they would work together in the real application. Since the authRoute file already imports and uses the controllers, when mount authRoute in Express app, any request made to the endpoints will naturally invoke the corresponding controller functions.
// didn't import the controllers individually in this integration test file. Importing the route is sufficient, as it encapsulates all the necessary controller logic.

let app;
let mongoServer;

beforeAll(async () => {
  // set JWT
  process.env.JWT_SECRET = "testsecret";

  // start up DB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  // init
  app = express();
  app.use(express.json());
  // auth-related router
  app.use("/api/v1/auth", authRoute);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API Integration", () => {
  // cleanup env
  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a user with valid data", async () => {
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
    });

    it("should not register a user if the email is already registered", async () => {
      // pre-create a user
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
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // pre-create a user
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
      // pre-create a user
      await userModel.create({
        name: "John Doe",
        email: "john@example.com",
        password: await hashPassword("password123"),
        phone: "1234567890",
        address: "123 Main St",
        answer: "blue",
      });
    });

    it("should reset password with valid email, answer, and new password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "blue",
          newPassword: "newpassword456",
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Password Reset Successfully");

      // verify whether the password is updated by loging in with the new password
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
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "wrongAnswer",
          newPassword: "newpassword456",
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Wrong Email Or Answer");
    });

    it("should not reset password if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "john@example.com",
          answer: "blue",
          // missing newPassword
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "New Password is required");
    });
  });
});
