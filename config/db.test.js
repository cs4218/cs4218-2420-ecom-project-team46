import { afterEach } from "node:test";
import connectDB from "./db";
import mongoose from "mongoose";

jest.mock("mongoose");

describe("connectDB", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Connect to MongoDB and log connection host", async () => {
    mongoose.connect.mockImplementation(() => 
      Promise.resolve({
        connection: {
          host: "mockHost"
        }
      })
    );
  
    console.log = jest.fn();

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(console.log).toHaveBeenCalledWith(
      "Connected To Mongodb Database mockHost".bgMagenta.white
    );
  });

  test("Log error when connection fails", async () => {
    mongoose.connect.mockImplementation(() => 
      Promise.reject("mockError")
    );

    console.log = jest.fn();

    await connectDB();

    expect(console.log).toHaveBeenCalledWith(
      `Error in Mongodb mockError`.bgRed.white
    );
  });
});
