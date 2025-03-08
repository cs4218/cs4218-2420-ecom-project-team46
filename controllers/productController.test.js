import { faker } from "@faker-js/faker";
import braintree from "braintree";
import fs from "fs";
import { ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { describe } from "node:test";
import slugify from "slugify";
import categoryModel from "../models/categoryModel";
import orderModel from "../models/orderModel";
import productModel from "../models/productModel";
import {
  brainTreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  updateProductController,
  searchProductController,
  relatedProductController,
  productCategoryController,
} from "./productController";

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
  {
    _id: new ObjectId(),
    name: "Smartwatch",
    description:
      "Feature-packed smartwatch with fitness tracking and notifications.",
    price: 149.99,
    category: new ObjectId(),
    quantity: 200,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with tactile switches.",
    price: 89.99,
    category: new ObjectId(),
    quantity: 150,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Gaming Mouse",
    description: "Ergonomic gaming mouse with customizable DPI settings.",
    price: 59.99,
    category: new ObjectId(),
    quantity: 300,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "External SSD",
    description: "Fast portable SSD with USB-C for high-speed transfers.",
    price: 179.99,
    category: new ObjectId(),
    quantity: 120,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Smart Home Hub",
    description: "Voice-controlled smart home hub for automation.",
    price: 99.99,
    category: new ObjectId(),
    quantity: 250,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Game Controller",
    description: "Xbox controller.",
    price: 39.99,
    category: new ObjectId(),
    quantity: 20,
    shipping: true,
  },
];

const photos = [
  {
    path: "./test-photo0.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo 0"),
  },
  {
    path: "./test-photo1.jpg",
    type: "image/png",
    buffer: Buffer.from("dummy photo 1"),
  },
  {
    path: "./test-photo2.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo 2"),
  },
  {
    path: "./test-photo3.jpg",
    type: "image/png",
    buffer: Buffer.from("dummy photo 3"),
  },
  {
    path: "./test-photo4.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo 4"),
  },
  {
    path: "./test-photo5.jpg",
    type: "image/png",
    buffer: Buffer.from("dummy photo 5"),
  },
  {
    path: "./test-photo6.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo 6"),
  },
  {
    path: "./test-photo7.jpg",
    type: "image/jpeg",
    buffer: Buffer.from("dummy photo 7"),
  },
];

// List of dummy categories, needed for testing as well, insert using categoryModel if necessary
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
  {
    _id: products[2].category,
    name: "cat2",
    slug: "cat2",
  },
  {
    _id: products[3].category,
    name: "cat3",
    slug: "cat3",
  },
  {
    _id: products[4].category,
    name: "cat4",
    slug: "cat4",
  },
  {
    _id: products[5].category,
    name: "cat5",
    slug: "cat5",
  },
  {
    _id: products[6].category,
    name: "cat6",
    slug: "cat6",
  },
  {
    _id: products[7].category,
    name: "cat7",
    slug: "cat7",
  },
];

// mock objects for product and category search

const categortId1 = new ObjectId();
const categortId2 = new ObjectId();
const categortId3 = new ObjectId();
const categortId4 = new ObjectId();
const productId1 = new ObjectId();
const productId2 = new ObjectId();
const productId3 = new ObjectId();

const categoriesSearch = [
  {
    _id: categortId1,
    name: "cat0",
    slug: "cat0",
  },
  {
    _id: categortId2,
    name: "cat1",
    slug: "cat1",
  },
  {
    _id: categortId3,
    name: "cat2",
    slug: "cat2",
  },
  {
    _id: categortId4,
    name: "cat3",
    slug: "cat3",
  },
];

const productsSearch = [
  {
    _id: productId1,
    name: "Wireless Headphones",
    description:
      "High-quality noise-canceling headphones with long battery life.",
    price: 199.99,
    category: categortId1,
    quantity: 100,
    shipping: true,
  },
  {
    _id: productId2,
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass and clear sound.",
    price: 49.99,
    category: categortId2,
    quantity: 250,
    shipping: true,
  },
  {
    _id: productId3,
    name: "Card Games",
    description: "Fun for family and friends.",
    price: 145,
    category: categortId3,
    quantity: 10,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Wired Speaker",
    description: "Wired speaker having good quality.",
    price: 145,
    category: categortId2,
    quantity: 10,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "High-end Speaker",
    description: "Luxurious experience for audiophiles.",
    price: 299.5,
    category: categortId2,
    quantity: 7,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Audio Soundbar",
    description: "For home movie experience.",
    price: 88.88,
    category: categortId2,
    quantity: 200,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Speaker",
    description: "Popular item.",
    price: 11.11,
    category: categortId2,
    quantity: 1220,
    shipping: true,
  },
  {
    _id: new ObjectId(),
    name: "Board Games",
    description: "Great entertainment.",
    price: 14.2,
    category: categortId3,
    quantity: 64,
    shipping: true,
  },
];

const searchProductsResults = [
  { searchPhrase: "speaker", numResults: 4 },
  { searchPhrase: "headphone", numResults: 1 },
  { searchPhrase: "HEADPHONES", numResults: 1 },
  { searchPhrase: "testphrase", numResults: 0 },
];

const relatedProductsResults = [
  { pid: productId1, cid: categortId1, numResults: 0 },
  { pid: productId2, cid: categortId2, numResults: 3 },
  { pid: productId3, cid: categortId3, numResults: 1 },
];

const searchProductCategoryResults = [
  { slug: categoriesSearch[0].slug, numResults: 1 },
  { slug: categoriesSearch[1].slug, numResults: 5 },
  { slug: categoriesSearch[3].slug, numResults: 0 },
];

// mock res object, to keep track of status code (201/500) and response content within tests
const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  set: jest.fn(),
  json: jest.fn(),
};

jest.mock("braintree", () => {
  const generate = jest.fn();
  const sale = jest.fn();
  return {
    ...jest.requireActual("braintree"),
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: {
        generate,
      },
      transaction: {
        sale,
      },
    })),
  };
});

jest.mock("../models/orderModel");

beforeAll(async () => {
  // set up in-memory mongo database for all tests in this file
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // mock fs.readFileSync to return dummy photo or throw error (used for photo data)
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

// clear mocks and remove all documents in product/category db collection before each test
beforeEach(async () => {
  jest.clearAllMocks();
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});
});

describe("createProductController tests", () => {
  const productData = products[0];
  const photoData = photos[0];

  it("should correctly create and save product with photo", async () => {
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

  it("should correctly create and save product without photo", async () => {
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

  it.each([
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

  it.each([
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

  it.each([
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
  it("should fail with 500 error when an error is thrown", async () => {
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
  it("should succeed with no products when mongo is empty", async () => {
    // check that the collection is empty
    expect(await productModel.countDocuments({})).toEqual(0);
    await getProductController({}, res);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: 0,
      message: "All Products",
      products: [],
    });
  });

  it("should succeed with products when mongo has documents", async () => {
    // insert categories into the category collection
    await categoryModel.insertMany(categories);

    // insert products into the product collection
    expect(await productModel.countDocuments({})).toEqual(0);
    for (let i = 0; i < products.length; i++) {
      await createProductController(
        { fields: products[i], files: { photo: photos[i] } },
        res
      );
    }
    expect(await productModel.countDocuments({})).toEqual(products.length);

    await getProductController({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const lastCall = res.send.mock.lastCall[0];
    // check http response sent
    expect(lastCall).toMatchObject({
      success: true,
      counTotal: products.length,
      message: "All Products",
    });

    // check that the correct number of products are received
    expect(lastCall.products.length).toBe(products.length);
  });

  it("should fail with 500 error when an error is thrown", async () => {
    // mock productModel.find to throw an error for testing
    jest.spyOn(productModel, "find");
    const error = new Error("getProductController Error");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    await getProductController({}, res);

    //check that error is thrown
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error in getting products",
      error: error,
    });

    // restore productModel.find from mock functionality
    productModel.find.mockRestore();
  });
});

describe("getSingleProductController tests", () => {
  it("should successfully find product based on slug", async () => {
    await categoryModel.insertMany(categories);

    // insert single product
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );

    await getSingleProductController(
      { params: { slug: slugify(products[0].name) } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);

    // check that the single product is correctly fetched
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

  it("should fail with 500 error when an error is thrown", async () => {
    // mock productModel.findOne to throw an error for testing
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
    // restore productModel.findOne from mock functionality
    productModel.findOne.mockRestore();
  });
});

describe("deleteProductController tests", () => {
  it("should successfully delete product", async () => {
    // insert two products
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    await createProductController(
      { fields: products[1], files: { photo: photos[1] } },
      res
    );
    expect(await productModel.countDocuments({})).toBe(2);
    // delete the first product (products[0])
    await deleteProductController({ params: { pid: products[0]._id } }, res);

    // products[1] should be the only remaining item in the collection
    expect(await productModel.countDocuments({})).toBe(1);
    const result = await productModel.findOne({});
    expect(result.id.toString()).toEqual(products[1]._id.toString());
    expect(res.status).toHaveBeenLastCalledWith(200);
    expect(res.send).toHaveBeenLastCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("should 404 and not delete any products if incorrect slug given", async () => {
    // insert a product (products[0])
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    expect(await productModel.countDocuments({})).toBe(1);

    // try to delete products[1], nothing should happen (no-op)
    await deleteProductController({ params: { pid: products[1]._id } }, res);

    // products[0] should be the only item in the collection
    expect(await productModel.countDocuments({})).toBe(1);
    expect(res.status).toHaveBeenLastCalledWith(404);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Product Not Found",
    });
  });

  it("should fail with 500 error when an error is thrown", async () => {
    // mock productModel.findByIdAndDelete to throw an error for testing
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
    // restore productModel.findByIdAndDelete from mock functionality
    productModel.findByIdAndDelete.mockRestore();
  });
});

describe("updateProductController tests", () => {
  it.each([
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

    // update only the field as parametrized
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

  it("should successfully update photo", async () => {
    // create product with photos[0]
    await createProductController(
      { fields: products[0], files: { photo: photos[0] } },
      res
    );
    const initialData = await productModel.findOne({ _id: products[0]._id });
    expect(initialData.photo.data.toString("base64")).toEqual(
      photos[0].buffer.toString("base64")
    );
    expect(initialData.photo.contentType).toEqual(photos[0].type);

    // update the product's photo to photos[1]
    await updateProductController(
      { params: { pid: products[0]._id }, files: { photo: photos[1] } },
      res
    );

    // verify that the photo is correctly updated to photos[1]
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

  describe("productPhotoController tests", () => {
    it("should successfully get photo", async () => {
      await categoryModel.insertMany(categories);
      await createProductController(
        { fields: products[0], files: { photo: photos[0] } },
        res
      );

      await productPhotoController({ params: { pid: products[0]._id } }, res);
      expect(res.status).toHaveBeenLastCalledWith(200);
      expect(res.set).toHaveBeenLastCalledWith("Content-type", photos[0].type);
      const lastCall = res.send.mock.lastCall[0];
      expect(Buffer.compare(lastCall, photos[0].buffer)).toBe(0);
    });

    it("should fail with 500 error when an error is thrown", async () => {
      // mock productModel.findById to throw an error for testing
      jest.spyOn(productModel, "findById");
      const error = new Error("productPhotoController Error");
      productModel.findById.mockImplementation(() => {
        throw error;
      });
      await productPhotoController({ params: { pid: "random-pid" } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenLastCalledWith({
        success: false,
        message: "Error while getting photo",
        error: error,
      });
      // restore productModel.findById from mock functionality
      productModel.findById.mockRestore();
    });
  });

  describe("productFiltersController tests", () => {
    it("should filter by price successfully", async () => {
      await categoryModel.insertMany(categories);

      for (let i = 0; i < products.length; i++) {
        await createProductController(
          { fields: products[i], files: { photo: photos[i] } },
          res
        );
      }

      const lower = 100;
      const upper = 9999;

      await productFiltersController(
        { body: { checked: [], radio: [lower, upper] } },
        res
      );
      expect(res.status).toHaveBeenLastCalledWith(200);

      // check that only the >$100 products are fetched.
      const indices = [];
      products.forEach((product, index) => {
        if (product.price >= 100) {
          indices.push(index);
        }
      });

      const lastCall = res.send.mock.lastCall[0];
      expect(lastCall).toMatchObject({
        success: true,
      });
      expect(lastCall.products.length).toBe(indices.length);
      for (let i = 0; i < lastCall.products.length; i++) {
        expect(lastCall.products[i].price).toBeGreaterThanOrEqual(100);
      }
    });

    it("should filter by one category successfully", async () => {
      await categoryModel.insertMany(categories);

      for (let i = 0; i < products.length; i++) {
        await createProductController(
          { fields: products[i], files: { photo: photos[i] } },
          res
        );
      }

      await productFiltersController(
        { body: { checked: [categories[0]._id], radio: [] } },
        res
      );
      expect(res.status).toHaveBeenLastCalledWith(200);

      // check that only the category = cat0 product is fetched.
      const lastCall = res.send.mock.lastCall[0];
      expect(lastCall).toMatchObject({
        success: true,
      });
      expect(lastCall.products.length).toBe(1);
      expect(products[0]).toMatchObject({
        _id: lastCall.products[0]._id,
        name: lastCall.products[0].name,
        description: lastCall.products[0].description,
        price: lastCall.products[0].price,
        quantity: lastCall.products[0].quantity,
        shipping: lastCall.products[0].shipping,
      });
    });

    it("should filter by multiple categories successfully", async () => {
      await categoryModel.insertMany(categories);

      for (let i = 0; i < products.length; i++) {
        await createProductController(
          { fields: products[i], files: { photo: photos[i] } },
          res
        );
      }

      await productFiltersController(
        {
          body: { checked: [categories[0]._id, categories[1]._id], radio: [] },
        },
        res
      );
      expect(res.status).toHaveBeenLastCalledWith(200);

      // check that both products are fetched.
      const lastCall = res.send.mock.lastCall[0];
      expect(lastCall).toMatchObject({
        success: true,
      });
      expect(lastCall.products.length).toBe(2);
    });

    it("should fail with 400 error when an error is thrown", async () => {
      // mock productModel.find to throw an error for testing
      jest.spyOn(productModel, "find");
      const error = new Error("productFiltersController Error");
      productModel.find.mockImplementation(() => {
        throw error;
      });
      await productFiltersController({ body: { checked: [], radio: [] } }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenLastCalledWith({
        success: false,
        message: "Error while Filtering Products",
        error: error,
      });
      // restore productModel.find from mock functionality
      productModel.find.mockRestore();
    });
  });

  describe("productCountController tests", () => {
    it("should return 0 when db is empty", async () => {
      await productCountController({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ success: true, total: 0 });
    });

    it("should return correct count when db is not empty", async () => {
      for (let i = 0; i < products.length; i++) {
        await createProductController(
          { fields: products[i], files: { photo: photos[i] } },
          res
        );
      }
      await productCountController({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        total: products.length,
      });
    });

    it("should fail with 400 error when an error is thrown", async () => {
      // mock productModel.find to throw an error for testing
      jest.spyOn(productModel, "find");
      const error = new Error("productCountController Error");
      productModel.find.mockImplementation(() => {
        throw error;
      });
      await productCountController({}, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenLastCalledWith({
        success: false,
        message: "Error in product count",
        error: error,
      });
      // restore productModel.find from mock functionality
      productModel.find.mockRestore();
    });
  });

  describe("productListController tests", () => {
    it("should correctly split the products into two pages", async () => {
      // we insert 8 products here
      for (let i = 0; i < products.length; i++) {
        await createProductController(
          { fields: products[i], files: { photo: photos[i] } },
          res
        );
      }

      // check that the first page contains 6 products
      await productListController({ params: { page: 1 } }, res);
      let lastCall = res.send.mock.lastCall[0];
      expect(lastCall.products.length).toBe(6);

      // check that the second page contains the last 2 products
      await productListController({ params: { page: 2 } }, res);
      lastCall = res.send.mock.lastCall[0];
      expect(lastCall.products.length).toBe(2);
    });

    it("should fail with 400 error when an error is thrown", async () => {
      // mock productModel.find to throw an error for testing
      jest.spyOn(productModel, "find");
      const error = new Error("productListController Error");
      productModel.find.mockImplementation(() => {
        throw error;
      });
      await productListController({ params: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenLastCalledWith({
        success: false,
        message: "error in per page ctrl",
        error: error,
      });
      // restore productModel.find from mock functionality
      productModel.find.mockRestore();
    });
  });
});

describe("braintreeTokenController tests", () => {
  const gateway = new braintree.BraintreeGateway();
  const req = {};

  it("should generate and send client token successfully", async () => {
    const mockedClientToken = {
      clientToken: faker.internet.jwt().repeat(6),
      success: true,
    };
    gateway.clientToken.generate.mockImplementation((_, callback) => {
      callback(null, mockedClientToken);
    });

    await braintreeTokenController(req, res);

    expect(res.send).toHaveBeenCalledWith(mockedClientToken);
  });

  it("should return 500 and send error on failure", async () => {
    const error = new Error("Internal Server Error");
    gateway.clientToken.generate.mockImplementation((_, callback) => {
      callback(error);
    });

    await braintreeTokenController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(error);
  });
});

describe("brainTreePaymentController tests", () => {
  const gateway = new braintree.BraintreeGateway();
  const nonce = "fake-nonce";
  const req = {
    body: {
      nonce,
      cart: [
        { price: parseFloat(faker.commerce.price()) },
        { price: parseFloat(faker.commerce.price()) },
        { price: parseFloat(faker.commerce.price()) },
      ],
    },
    user: {
      _id: faker.string.uuid(),
    },
  };

  it("should process payment and create an order on successful transaction", async () => {
    const mockedSuccessfulSaleTransaction = {
      success: true,
      message: "Payment successful",
    };
    const mockOrder = {
      _id: faker.string.uuid(),
      products: req.body.cart,
      payment: mockedSuccessfulSaleTransaction,
    };
    gateway.transaction.sale.mockImplementation((_, callback) => {
      callback(null, mockedSuccessfulSaleTransaction);
    });
    orderModel.create.mockResolvedValue(mockOrder);

    await brainTreePaymentController(req, res);

    expect(gateway.transaction.sale).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: req.body.cart
          .reduce((acc, item) => acc + item.price, 0)
          .toFixed(2),
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      }),
      expect.any(Function)
    );
    expect(orderModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        products: req.body.cart,
        payment: mockedSuccessfulSaleTransaction,
        buyer: req.user._id,
      })
    );
    expect(res.json).toHaveBeenCalledWith({ ok: true, order: mockOrder });
  });

  it("should return 402 and send error on payment failure", async () => {
    const mockedFailedSaleTransaction = {
      success: false,
      message: "Payment failed",
    };
    gateway.transaction.sale.mockImplementation((_, callback) => {
      callback(null, mockedFailedSaleTransaction);
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.send).toHaveBeenCalledWith({
      error: mockedFailedSaleTransaction.message,
    });
  });

  it("should return 500 and send error on failure", async () => {
    const error = new Error("Internal Server Error");
    gateway.transaction.sale.mockImplementation((_, callback) => {
      callback(error);
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(error);
  });
});

describe("searchProductController tests", () => {
  it.each(searchProductsResults)(
    "should return matching products based on keyword",
    async ({ searchPhrase, numResults }) => {
      for (let i = 0; i < productsSearch.length; i += 1) {
        await createProductController(
          { fields: productsSearch[i], files: { photo: photos[i] } },
          res
        );
      }

      const req = { params: { keyword: searchPhrase } };

      await searchProductController(req, res);

      expect(res.json).toHaveBeenCalledTimes(1);

      const jsonResponse = res.json.mock.calls[0][0];

      const regex = new RegExp(searchPhrase, "i");
      const allMatch = jsonResponse.every(
        (product) => regex.test(product.name) || regex.test(product.description)
      );

      expect(allMatch).toBe(true);
      expect(jsonResponse.length).toBe(numResults);
    }
  );

  it("should handle errors and return status 400", async () => {
    jest.spyOn(productModel, "find");
    const error = new Error("searchProductController Error");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    const req = { params: { keyword: "test" } };

    await searchProductController(req, res);

    //check that error is thrown
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error in search product API",
      error: error,
    });

    // restore productModel.find from mock functionality
    productModel.find.mockRestore();
  });
});

describe("relatedProductController tests", () => {
  it.each(relatedProductsResults)(
    "should return matching products based on category",
    async ({ pid, cid, numResults }) => {
      await categoryModel.insertMany(categoriesSearch);

      for (let i = 0; i < productsSearch.length; i += 1) {
        await createProductController(
          { fields: productsSearch[i], files: { photo: photos[0] } },
          res
        );
      }

      const req = { params: { pid, cid } };

      await relatedProductController(req, res);

      expect(res.status).toHaveBeenLastCalledWith(200);

      const jsonResponse = res.send.mock.lastCall[0].products;

      const allCorrectCategory = jsonResponse.every(
        (product) => product.category._id.toString() === cid.toString()
      );
      expect(allCorrectCategory).toBe(true);

      expect(jsonResponse.length).toBe(numResults);
    }
  );

  it("should handle errors and return status 400", async () => {
    jest.spyOn(productModel, "find");
    const error = new Error("relatedProductController Error");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    const req = { params: { keyword: "test" } };

    await relatedProductController(req, res);

    //check that error is thrown
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error while getting related product",
      error: error,
    });

    // restore productModel.find from mock functionality
    productModel.find.mockRestore();
  });
});

describe("productCategoryController tests", () => {
  it.each(searchProductCategoryResults)(
    "should return matching products based on category slug",
    async ({ slug, numResults }) => {
      await categoryModel.insertMany(categoriesSearch);

      for (let i = 0; i < productsSearch.length; i += 1) {
        await createProductController(
          { fields: productsSearch[i], files: { photo: photos[0] } },
          res
        );
      }

      const req = { params: { slug } };

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenLastCalledWith(200);

      const jsonResponse = res.send.mock.lastCall[0].products;

      const allCorrectCategory = jsonResponse.every(
        (product) => product.category.slug === slug
      );
      expect(allCorrectCategory).toBe(true);

      expect(jsonResponse.length).toBe(numResults);
    }
  );

  it("should handle errors and return status 400", async () => {
    jest.spyOn(productModel, "find");
    const error = new Error("productCategoryController Error");
    productModel.find.mockImplementation(() => {
      throw error;
    });

    const req = { params: { keyword: "test" } };

    await productCategoryController(req, res);

    //check that error is thrown
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenLastCalledWith({
      success: false,
      message: "Error while getting products",
      error: error,
    });

    // restore productModel.find from mock functionality
    productModel.find.mockRestore();
  });
});
