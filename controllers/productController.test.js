import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {
  createProductController,
  getProductController,
} from "./productController";
import fs from "fs";
import { ObjectId } from "mongodb";
import { describe } from "node:test";
import categoryModel from "../models/categoryModel";

// in-memory mongo server for testing
let mongoServer;

// list of dummy product and photo data, can be accessed/copied/modified if necessary within tests
const products = [
  {
    _id: new ObjectId(),
    name: "Wireless Headphones",
    description: "High-quality noise-canceling headphones.",
    price: 199.99,
    category: new ObjectId(),
    quantity: 100,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass and clear sound.",
    price: 49.99,
    category: new ObjectId(),
    quantity: 250,
    shipping: true,
  },
];

const photos = [
  {
    path: "./test-photo.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo"),
  },
  {
    path: "./test-photo2.jpg",
    type: "image/png",
    buffer: Buffer.from("dummy photo 2"),
  },
];

// list of dummy categories, needed for testing as well, insert using categoryModel if necessary
const categories = [
  {
    _id: products[0].category,
    name: "cat0",
    slug: "cat0",
  },
  {
    _id: products[1].category,
    name: "cat1",
    slug: "cat1",
  },
];

// mock res object, to keep track of status code (201/500) and response content within tests
const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

beforeAll(async () => {
  // set up in-memory mongo database for all tests in this file
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // mock fs.readFileSync to return dummy photo or throw error for createProductController tests
  jest.spyOn(fs, "readFileSync").mockImplementation((path) => {
    const photo = photos.find((photo) => photo.path === path);
    if (photo) {
      return photo.buffer;
    } else {
      throw new Error("Invalid photo path");
    }
  });
});

// after tests are done, cleanup/teardown in-memory mongo database
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// clear res mocks and remove all documents in product db collection before each test
beforeEach(async () => {
  res.status.mockClear();
  res.send.mockClear();
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});
});

describe("createProductController tests", () => {
  // choose the first element of our list as mock product and photo data for createProductController testsgit
  const productData = products[0];
  const photoData = photos[0];

  test("should correctly create and save product with photo", async () => {
    const req = { fields: productData, files: { photo: photoData } };

    await createProductController(req, res);

    // query in-memory mongo collection for document
    const savedProduct = await productModel.findOne({
      _id: productData._id,
    });

    // check that the req fields are saved correctly into the mongo document
    expect({
      _id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      category: savedProduct.category,
      quantity: savedProduct.quantity,
      shipping: savedProduct.shipping,
    }).toEqual(productData);

    // check that the photo data is correctly stored in the mongo document
    expect(savedProduct.photo.data.toString("base64")).toEqual(
      photoData.buffer.toString("base64")
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

  test("should correctly create and save product without photo", async () => {
    const req = { fields: productData, files: {} };

    await createProductController(req, res);

    // query in-memory mongo collection for document
    const savedProduct = await productModel.findOne({
      _id: productData._id,
    });

    // check that the req fields are saved correctly into the mongo document
    expect({
      _id: savedProduct._id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      category: savedProduct.category,
      quantity: savedProduct.quantity,
      shipping: savedProduct.shipping,
    }).toEqual(productData);

    // expect http response code 201 (created successfully)
    expect(res.status).toHaveBeenCalledWith(201);

    // expect correct http response
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.objectContaining(productData),
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
      // delete the field from productDataCopy to simulate it being missing
      const productDataCopy = { ...productData };
      delete productDataCopy[field];
      expect(productDataCopy).not.toHaveProperty(field);

      const req = { fields: productDataCopy, files: { photo: photoData } };

      await createProductController(req, res);

      // expect validation switch case to return 500 error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: errorMessage });
    }
  );

  test.each([
    { field: "name", value: "", errorMessage: "Name is Required" },
    {
      field: "description",
      value: "",
      errorMessage: "Description is Required",
    },
    { field: "price", value: 0, errorMessage: "Price is Required" },
    { field: "category", value: "", errorMessage: "Category is Required" },
    { field: "quantity", value: 0, errorMessage: "Quantity is Required" },
  ])(
    "should fail with 500 error when %s field is an empty string/0 for numerical values)",
    async ({ field, value, errorMessage }) => {
      // set the field to simulate it being empty string/0
      const productDataCopy = { ...productData };
      productDataCopy[field] = value;

      const req = { fields: productDataCopy, files: { photo: photoData } };

      await createProductController(req, res);

      // expect validation switch case to return 500 error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: errorMessage });
    }
  );

  test.each([
    { size: 100000, statusCode: 201 },
    { size: 999999, statusCode: 201 },
    { size: 1000000, statusCode: 201 },
    { size: 1000001, statusCode: 500 },
    { size: 2000000, statusCode: 500 },
  ])(
    "should only allow photos <1MB to pass with status 201, 500 otherwise",
    async ({ size, statusCode }) => {
      const req = {
        fields: productData,
        files: { photo: { ...photoData, size: size } },
      };
      await createProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(statusCode);
    }
  );
  test("should fail with 500 error when an error is thrown", async () => {
    const req = {
      fields: productData,
      files: {
        photo: {
          path: "wrong-photo-path",
          type: "image/jpeg",
        },
      },
    };

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: new Error("Invalid photo path"),
      message: "Error in creating product",
      success: false,
    });
  });
});

describe("getProductController tests", () => {
  beforeEach(async () => {
    await categoryModel.insertMany(categories);
  });
  test("should succeed with no products when mongo is empty", async () => {
    expect(await productModel.countDocuments({})).toEqual(0);
    await getProductController({}, res);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: 0,
      message: "All Products",
      products: [],
    });
  });
  test("should succeed with products when mongo has documents", async () => {
    expect(await productModel.countDocuments({})).toEqual(0);

    for (let i = 0; i < products.length; i++) {
      await createProductController(
        { fields: products[i], files: { photo: photos[i] } },
        res
      );
    }

    expect(await productModel.countDocuments({})).toEqual(2);

    await getProductController({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const lastCall = res.send.mock.lastCall[0];
    expect(lastCall).toMatchObject({
      success: true,
      counTotal: 2,
      message: "All Products",
    });

    for (let i = 0; i < lastCall.products.length; i++) {
      const currProduct = products[products.length - i - 1];
      const currCategory = categories[categories.length - i - 1];
      expect(currProduct).toMatchObject({
        _id: lastCall.products[i]._id,
        name: lastCall.products[i].name,
        description: lastCall.products[i].description,
        price: lastCall.products[i].price,
        quantity: lastCall.products[i].quantity,
        shipping: lastCall.products[i].shipping,
      });
      expect(lastCall.products[i].category).toMatchObject(currCategory);
    }
  });
  test("should fail with 500 error when an error is thrown", async () => {
    jest.spyOn(productModel, "find");
    const error = new Error("getProductController Error");
    productModel.find.mockImplementation(() => {
      throw error;
    });
    await getProductController({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error in getting products",
      error: error,
    });
  });
});
