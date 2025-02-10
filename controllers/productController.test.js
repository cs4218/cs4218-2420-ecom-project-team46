import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel"; // Path to your product model
import { createProductController } from "./productController";
import fs from "fs";
import { ObjectId } from "mongodb";

let mongoServer;

const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
}; // mock res object to pass into controller

// mock photo data and behaviour to use across test cases
const photoData = {
  path: "./test-photo.jpg",
  type: "image/jpeg",
};
const photoBuffer = Buffer.from("dummy photo");
fs.readFileSync = jest.fn().mockReturnValue(photoBuffer);

describe("createProductController", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Close the mongoose connection and stop the in-memory MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await productModel.deleteMany({});
  });

  test("should correctly create and save product", async () => {
    const id = new ObjectId();
    const categoryId = new ObjectId();
    const productData = {
      _id: id,
      name: "Wireless Headphones",
      description: "High-quality noise-canceling headphones.",
      price: 199.99,
      category: categoryId,
      quantity: 100,
      shipping: true,
    };
    const req = { fields: productData, files: { photo: photoData } };

    await createProductController(req, res);

    const savedProduct = await productModel.findOne({
      _id: id,
    });

    // check that the req fields are saved correctly into the product
    expect({
      _id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      category: savedProduct.category,
      quantity: savedProduct.quantity,
      shipping: savedProduct.shipping,
    }).toEqual(productData);

    // check that the photo data is correctly stored in the database
    expect(savedProduct.photo.data.toString("base64")).toEqual(
      photoBuffer.toString("base64")
    );
    expect(savedProduct.photo.contentType).toEqual(photoData.type);

    // expect http response code 201 (created successfully)
    expect(res.status).toHaveBeenCalledWith(201);

    // expect correct http response
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.objectContaining({
        ...productData,
        photo: expect.objectContaining({
          contentType: photoData.type,
          data: expect.anything(),
        }),
      }),
    });
  });

  test.each([
    { field: "name", errorMessage: "Name is Required" },
    { field: "description", errorMessage: "Description is Required" },
    { field: "price", errorMessage: "Price is Required" },
    { field: "category", errorMessage: "Category is Required" },
    { field: "quantity", errorMessage: "Quantity is Required" },
  ])(
    "should fail with 500 error when name/description/price/category/quantity field is missing",
    async ({ field, errorMessage }) => {
      const id = new ObjectId();
      const categoryId = new ObjectId();

      const productData = {
        _id: id,
        name: "Wireless Headphones",
        description: "High-quality noise-canceling headphones.",
        price: 199.99,
        category: categoryId,
        quantity: 100,
        shipping: true,
      };

      delete productData[field];

      expect(productData).not.toHaveProperty(field); // check that the field is now gone from the request

      const req = { fields: productData, files: { photo: photoData } };

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: errorMessage });
    }
  );
});
