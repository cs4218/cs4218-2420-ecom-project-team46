import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "./userModel";

let mongoServer;

describe("User Model Test", () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  test("Should create user successfully", async () => {
    const user = new User({
      name: "user123",
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
      role: 0
    });
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(user.name);
    expect(savedUser.email).toBe(user.email);
    expect(savedUser.password).toBe(user.password);
    expect(savedUser.phone).toBe(user.phone);
    expect(savedUser.address).toEqual(user.address);
    expect(savedUser.answer).toBe(user.answer);
    expect(savedUser.role).toBe(0);
  });

  test("Should fail if 'name' is missing", async () => {
    const user = new User({
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("Should fail if 'email' is missing", async () => {
    const user = new User({
      name: "user123",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("Should fail if 'password' is missing", async () => {
    const user = new User({
      email: "user123@testing.com",
      name: "user123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("Should fail if 'phone' is missing", async () => {
    const user = new User({
      email: "user123@testing.com",
      password: "password123",
      name: "user123",
      address: "bukitpanjang",
      answer: "blue",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });
  test("Should fail if 'address' is missing", async () => {
    const user = new User({
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      name: "user123",
      answer: "blue",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("Should fail if 'answer' is missing", async () => {
    const user = new User({
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      name: "user123",
      role: 0
    });

    await expect(user.save()).rejects.toThrow();
  });

  test("Default role is 0", async () => {
    const user = new User({
      name: "user123",
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
    });
    const savedUser = await user.save();

    expect(savedUser.role).toBe(0);
  });

  test("Should fail to create a user with duplicate email", async () => {
    const user1 = new User({
      name: "user123",
      email: "user123@testing.com",
      password: "password123",
      phone: "1234567890",
      address: "bukitpanjang",
      answer: "blue",
    });
    await user1.save();

    const user2 = new User({
      name: "Jane Doe",
      email: "user123@testing.com",
      password: "password456",
      phone: "0987654321",
      address: "bukitpanjang",
      answer: "green",
    });

    await expect(() => user2.save()).rejects.toThrow();
  });
});