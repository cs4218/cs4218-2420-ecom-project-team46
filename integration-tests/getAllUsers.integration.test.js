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

const users = [
  {
    _id: new ObjectId(),
    name: "uesr1",
    email: "user1@testing.com",
    password: "password1",
    phone: "1234567890",
    address: "bukitpanjang",
    answer: "blue",
    role: 0
  },
  {
    _id: new ObjectId(),
    name: "user2",
    email: "user2@testing.com",
    password: "password2",
    phone: "123453290",
    address: "bukitbatok",
    answer: "green",
    role: 0
  },
];

const admin = {
  _id: new ObjectId(),
  name: "admin",
  email: "admin@testing.com",
  password: "adminpassword",
  phone: "34556920",
  address: "bukit",
  answer: "yellow",
  role: 1,
}

beforeEach(async () => {
  process.env.JWT_SECRET = "jwt-secret";
  mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoServer.getUri());
  }

  await Promise.all(
    users.map(async (user) => {
      await User.create(user);
    })
  );

  await User.create(admin)
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Get all users integration test", () => {
  test("should return status 200 and a list of all users (including admins) when attempting to fetch users while authenticated as a admin", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/users")
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .expect(200);

    expect(response.body.users).toHaveLength(users.length + 1);

    response.body.users.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });

    const expectedList = [...users, admin]
    for (let i = 0; i < expectedList.length; i += 1) {
      expect(response.body.users[i].name).toBe(expectedList[i].name);
      expect(response.body.users[i].email).toBe(expectedList[i].email);
      expect(response.body.users[i].phone).toBe(expectedList[i].phone);
      expect(response.body.users[i].address).toBe(expectedList[i].address);
      expect(response.body.users[i].answer).toBe(expectedList[i].answer);
    }
  });

  test("should return status 401 if not signed in", async () => {
    await supertest(app)
    .get("/api/v1/auth/users")
    .expect(401);
  });

  test("should return status 401 if JWT is invalid", async () => {
    await supertest(app)
    .get("/api/v1/auth/users")
    .set(
      "Authorization",
      JWT.sign({ _id: admin._id }, "Random Secret Key")
    )
    .expect(401);
  });

  test("should return status 401 if not admin", async () => {
    await supertest(app)
    .get("/api/v1/auth/users")
    .set(
      "Authorization",
      JWT.sign({ _id: users[0]._id }, process.env.JWT_SECRET)
    )
    .expect(401);
  });

  test("should return status 500 if error happens in the backend", async () => {
    await mongoose.disconnect();

    await supertest(app)
    .get("/api/v1/auth/users")
    .set(
      "Authorization",
      JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
    )
    .expect(500);
  });
})