import express from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import authRoutes from "../routes/authRoute";
import JWT from "jsonwebtoken";
import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId } from "mongodb";

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);

let mongoServer;

const user = {
  _id: new ObjectId(),
  name: "uesr1",
  email: "user1@testing.com",
  password: "password1",
  phone: "1234567890",
  address: "bukitpanjang",
  answer: "blue",
  role: 0
}

beforeEach(async () => {
  process.env.JWT_SECRET = "jwt-secret";
  mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoServer.getUri());
  }
  
  await User.create(user);
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Update personal information integration test", () => {
  test("should return status 200 and return updated user data if successful", async () => {
    const expectedUser = {
      name: "userr1123",
      password: "password112313",
      phone: "123452333",
      address: "bukitpanjang",
    }
    
    const response = await supertest(app)
      .put("/api/v1/auth/profile")
      .set(
        "Authorization",
        JWT.sign({ _id: user._id }, process.env.JWT_SECRET)
      )
      .send(expectedUser)
      .expect(200);

    const updatedUser = response.body.updatedUser
    expect(updatedUser.name).toBe(expectedUser.name);
    expect(updatedUser.phone).toBe(expectedUser.phone);
    expect(updatedUser.address).toBe(expectedUser.address);
  });

  test("should return error message if password is too short", async () => {
    const expectedUser = {
      name: "userr1123",
      password: "short",
      phone: "123452333",
      address: "bukitpanjang",
    }
    
    const response = await supertest(app)
    .put("/api/v1/auth/profile")
    .set(
      "Authorization",
      JWT.sign({ _id: user._id }, process.env.JWT_SECRET)
    )
    .send(expectedUser)

    const json = JSON.parse(response.text)

    expect(json["error"]).toBe("Passsword is required and 6 character long");
  });

  test("should return status 401 if not signed in", async () => {
    const expectedUser = {
      name: "userr1123",
      password: "password112313",
      phone: "123452333",
      address: "bukitpanjang",
    }
    
    await supertest(app)
    .put("/api/v1/auth/profile")
    .send(expectedUser)
    .expect(401);
  });

  test("should return status 401 if JWT is invalid", async () => {
    const expectedUser = {
      name: "userr1123",
      password: "password112313",
      phone: "123452333",
      address: "bukitpanjang",
    }
    
    await supertest(app)
    .put("/api/v1/auth/profile")
    .set(
      "Authorization",
      JWT.sign({ _id: user._id }, "Random secret token")
    )
    .send(expectedUser)
    .expect(401);
  });

  test("should return status 400 if user is not in database", async () => {
    const expectedUser = {
      name: "userr1123",
      password: "password112313",
      phone: "123452333",
      address: "bukitpanjang",
    }
    
    await supertest(app)
    .put("/api/v1/auth/profile")
    .set(
      "Authorization",
      JWT.sign({ _id: 12345 }, process.env.JWT_SECRET)
    )
    .send(expectedUser)
    .expect(400);
  });

  test("should return status 400 if error happens in the backend", async () => {
    await mongoose.disconnect();

    const expectedUser = {
      name: "userr1123",
      password: "password112313",
      phone: "123452333",
      address: "bukitpanjang",
    }

    await supertest(app)
    .put("/api/v1/auth/profile")
    .set(
      "Authorization",
      JWT.sign({ _id: user._id }, process.env.JWT_SECRET)
    )
    .send(expectedUser)
    .expect(400);
  });
})