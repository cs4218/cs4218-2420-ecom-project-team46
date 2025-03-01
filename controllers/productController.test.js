import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel";
import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  updateProductController,
  searchProductController,
  relatedProductController,
  productCategoryController
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
  json: jest.fn(),
};

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
    description: "High-quality noise-canceling headphones with long battery life.",
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
    price: 299.50,
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
    price: 14.20,
    category: categortId3,
    quantity: 64,
    shipping: true,
  },
];

const searchProductsResults = [
  {searchPhrase: "speaker", numResults: 4},
  {searchPhrase: "headphone", numResults: 1},
  {searchPhrase: "HEADPHONES", numResults: 1},
  {searchPhrase: "testphrase", numResults: 0},
];

const relatedProductsResults = [
  {pid: productId1, cid: categortId1, numResults: 0},
  {pid: productId2, cid: categortId2, numResults: 3},
  {pid: productId3, cid: categortId3, numResults: 1},
];

const searchProductCategoryResults = [
  {slug: categoriesSearch[0].slug, numResults: 1},
  {slug: categoriesSearch[1].slug, numResults: 5},
  {slug: categoriesSearch[3].slug, numResults: 0},
];

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

  test("createProductController should correctly create and save product with photo", async () => {
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

  test("createProductController should correctly create and save product without photo", async () => {
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
    "createProductController should fail with 500 error when name/description/price/category/quantity field is missing",
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
    "createProductController should fail with 500 error when %s field is an empty string/0 for numerical values)",
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
    "createProductController should only allow photos <1MB to pass with status 201, 500 otherwise",
    async ({ size, statusCode }) => {
      const req = {
        fields: productData,
        files: { photo: { ...photoData, size: size } },
      };
      await createProductController(req, res);
      expect(res.status).toHaveBeenCalledWith(statusCode);
    }
  );
  test("createProductController should fail with 500 error when an error is thrown", async () => {
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
  test("getProductController should succeed with no products when mongo is empty", async () => {
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

  test("getProductController should succeed with products when mongo has documents", async () => {
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
    expect(await productModel.countDocuments({})).toEqual(2);

    await getProductController({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const lastCall = res.send.mock.lastCall[0];
    // check http response sent
    expect(lastCall).toMatchObject({
      success: true,
      counTotal: 2,
      message: "All Products",
    });

    // check that response contains correct products
    for (let i = 0; i < lastCall.products.length; i++) {
      const currProduct = products[products.length - i - 1]; // order is reversed due to sort({createdAt: -1}) in getProductController
      const currCategory = categories[categories.length - i - 1]; // order is reversed due to sort({createdAt: -1}) in getProductController
      // check that the product fields (except category) matches
      expect(currProduct).toMatchObject({
        _id: lastCall.products[i]._id,
        name: lastCall.products[i].name,
        description: lastCall.products[i].description,
        price: lastCall.products[i].price,
        quantity: lastCall.products[i].quantity,
        shipping: lastCall.products[i].shipping,
      });
      // check that the category data is correctly fetched from category collection
      expect(lastCall.products[i].category).toMatchObject(currCategory);
    }
  });

  test("getProductController should fail with 500 error when an error is thrown", async () => {
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
  test("getSingleProductController should successfully find product based on slug", async () => {
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

  test("getSingleProductController should fail with 500 error when an error is thrown", async () => {
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
  test("deleteProductController should successfully delete product", async () => {
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

  test("deleteProductController should 404 and not delete any products if incorrect slug given", async () => {
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

  test("deleteProductController should fail with 500 error when an error is thrown", async () => {
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
  ])(
    "updateProductController should successfully update fields (excl. photo)",
    async ({ req }) => {
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
        price:
          req.fieldToUpdate === "price" ? req.value : lastCall.product.price,
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
    }
  );

  test("updateProductController should successfully update photo", async () => {
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
});

describe("searchProductController tests", () => {

  test.each(searchProductsResults)
  ("searchProductController should return matching products based on keyword", 
    async ({searchPhrase, numResults}) => {

    for (let i = 0; i < productsSearch.length; i += 1 ) {
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
    const allMatch = jsonResponse.every((product) =>
      regex.test(product.name) || regex.test(product.description)
    );

    expect(allMatch).toBe(true);
    expect(jsonResponse.length).toBe(numResults); 
  });

  test("searchProductController should handle errors and return status 400", async () => {
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

  test.each(relatedProductsResults)
  ("relatedProductController should return matching products based on category", 
    async ({pid, cid, numResults}) => {

    await categoryModel.insertMany(categoriesSearch);

    for (let i = 0; i < productsSearch.length; i += 1 ) {
      await createProductController(
        { fields: productsSearch[i], files: { photo: photos[0] } },
        res
    )};

    const req = { params: { pid, cid } };

    await relatedProductController(req, res);

    expect(res.status).toHaveBeenLastCalledWith(200);

    const jsonResponse = res.send.mock.lastCall[0].products;

    const allCorrectCategory = jsonResponse.every(
      (product) => product.category._id.toString() === cid.toString());
    expect(allCorrectCategory).toBe(true);

    expect(jsonResponse.length).toBe(numResults); 
  });

  test("relatedProductController should handle errors and return status 400", async () => {
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

  test.each(searchProductCategoryResults)
  ("productCategoryController should return matching products based on category slug", 
    async ({slug, numResults}) => {

    await categoryModel.insertMany(categoriesSearch);

    for (let i = 0; i < productsSearch.length; i += 1 ) {
      await createProductController(
        { fields: productsSearch[i], files: { photo: photos[0] } },
        res
    )};

    const req = { params: { slug } };

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenLastCalledWith(200);

    const jsonResponse = res.send.mock.lastCall[0].products;

    const allCorrectCategory = jsonResponse.every(
      (product) => product.category.slug === slug);
    expect(allCorrectCategory).toBe(true);

    expect(jsonResponse.length).toBe(numResults); 
  });

  test("productCategoryController should handle errors and return status 400", async () => {
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