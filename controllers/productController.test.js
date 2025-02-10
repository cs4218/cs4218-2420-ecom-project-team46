import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  updateProductController,
} from "./productController";
import fs from "fs";
import { ObjectId } from "mongodb";
import { describe } from "node:test";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";

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
  jest.clearAllMocks();
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
    await categoryModel.insertMany(categories);

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
    productModel.find.mockRestore();
  });
});

describe("getSingleProductController tests", () => {
  test("should successfully find product based on slug", async () => {
    await categoryModel.insertMany(categories);

    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );

    await getSingleProductController(
      { params: { slug: slugify(products[0].name) } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const lastCall = res.send.mock.lastCall[0];
    expect(lastCall).toMatchObject({
      success: true,
      message: "Single Product Fetched",
    });
    expect(products[0]).toMatchObject({
      _id: lastCall.product._id,
      name: lastCall.product.name,
      description: lastCall.product.description,
      price: lastCall.product.price,
      quantity: lastCall.product.quantity,
      shipping: lastCall.product.shipping,
    });
    expect(lastCall.product.category).toMatchObject(categories[0]);
  });
  test("should fail with 500 error when an error is thrown", async () => {
    jest.spyOn(productModel, "findOne");
    const error = new Error("getSingleProductController Error");
    productModel.findOne.mockImplementation(() => {
      throw error;
    });
    await getSingleProductController({ params: { slug: "random-slug" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error while getitng single product",
      error: error,
    });
    productModel.findOne.mockRestore();
  });
});

describe("deleteProductController tests", () => {
  test("should successfully delete product", async () => {
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    await createProductController(
      { fields: products[1], files: { photo: photos[1] } },
      res
    );
    expect(await productModel.countDocuments({})).toBe(2);
    await deleteProductController({ params: { pid: products[0]._id } }, res);

    await productModel.find({});
    expect(await productModel.countDocuments({})).toBe(1);
    expect(res.status).toHaveBeenLastCalledWith(200);
    expect(res.send).toHaveBeenLastCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  test("should 404 and not delete any products if incorrect slug given", async () => {
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    expect(await productModel.countDocuments({})).toBe(1);
    await deleteProductController({ params: { pid: products[1]._id } }, res);
    expect(await productModel.countDocuments({})).toBe(1);
    expect(res.status).toHaveBeenLastCalledWith(404);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Product Not Found",
    });
  });
  test("should fail with 500 error when an error is thrown", async () => {
    jest.spyOn(productModel, "findByIdAndDelete");
    const error = new Error("deleteProductController Error");
    productModel.findByIdAndDelete.mockImplementation(() => {
      throw error;
    });
    await deleteProductController({ params: { pid: "random-pid" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error while deleting product",
      error: error,
    });
    productModel.findByIdAndDelete.mockRestore();
  });
});

describe("updateProductController tests", () => {
  test.each([
    {
      req: { fields: { name: "newName" } },
      fieldToUpdate: "name",
      value: "newName",
    },
    {
      req: { fields: { description: "newDescription" } },
      fieldToUpdate: "description",
      value: "newDescription",
    },
    {
      req: { fields: { price: 91235.44 } },
      fieldToUpdate: "price",
      value: 91235.44,
    },
    {
      req: { fields: { category: new ObjectId() } },
      fieldToUpdate: "category",
      value: new ObjectId(),
    },
    {
      req: { fields: { quantity: 999 } },
      fieldToUpdate: "quantity",
      value: 999,
    },
    {
      req: { fields: { shipping: false } },
      fieldToUpdate: "shipping",
      value: false,
    },
  ])("should successfully update fields (excl. photo)", async ({ req }) => {
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );

    req.params = { pid: products[0]._id };
    await updateProductController(req, res);

    const savedProduct = await productModel.findOne({
      _id: products[0]._id,
    });

    // check that the relevant fields are updated
    expect(savedProduct[req.fieldToUpdate]).toEqual(req.value);

    expect(res.status).toHaveBeenLastCalledWith(200);

    // expect correct http response
    const lastCall = res.send.mock.lastCall[0];
    expect(lastCall).toMatchObject({
      success: true,
      message: "Product updated successfully",
    });
    expect(savedProduct).toMatchObject({
      name: req.fieldToUpdate === "name" ? req.value : lastCall.product.name,
      description:
        req.fieldToUpdate === "description"
          ? req.value
          : lastCall.product.description,
      price: req.fieldToUpdate === "price" ? req.value : lastCall.product.price,
      category:
        req.fieldToUpdate === "category"
          ? req.value
          : lastCall.product.category,
      quantity:
        req.fieldToUpdate === "quantity"
          ? req.value
          : lastCall.product.quantity,
      shipping:
        req.fieldToUpdate === "shipping"
          ? req.value
          : lastCall.product.shipping,
    });
  });

  test("should successfully update photo", async () => {
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    const initialData = await productModel.findOne({ _id: products[0]._id });
    expect(initialData.photo.data.toString("base64")).toEqual(
      photos[0].buffer.toString("base64")
    );
    expect(initialData.photo.contentType).toEqual(photos[0].type);
    await updateProductController(
      { params: { pid: products[0]._id }, files: { photo: photos[1] } },
      res
    );
    const finalData = await productModel.findOne({ _id: products[0]._id });
    expect(finalData.photo.data.toString("base64")).toEqual(
      photos[1].buffer.toString("base64")
    );
    expect(finalData.photo.contentType).toEqual(photos[1].type);
    expect(res.status).toHaveBeenLastCalledWith(200);
    const lastCall = res.send.mock.lastCall[0];
    expect(lastCall).toMatchObject({
      success: true,
      message: "Product updated successfully",
    });
    expect(finalData).toMatchObject({
      ...products[0],
    });
  });
});
