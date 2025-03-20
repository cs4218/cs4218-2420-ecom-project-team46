import express from "express";
import mongoose from "mongoose";
import {
  createProductController,
  getProductController,
} from "../controllers/productController";
import request from "supertest";
import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";
import { ObjectId } from "mongodb";
import { describe } from "node:test";
import ExpressFormidable from "express-formidable";

let app;

const categories = [
  {
    _id: new ObjectId(),
    name: "Headphones",
    slug: "headphones",
  },
  {
    _id: new ObjectId(),
    name: "Shoes",
    slug: "shoes",
  },
  {
    _id: new ObjectId(),
    name: "Smartphones",
    slug: "smartphones",
  },
];
const products = [
  {
    name: "Apple iPhone 14",
    slug: "apple-iphone-14",
    description:
      "The latest iPhone with a stunning display and powerful camera.",
    price: 999.99,
    category: categories[2]._id.toString(),
    quantity: 100,
    photo: {
      data: Buffer.from("dummyimage", "utf-8"),
      contentType: "image/jpeg",
    },
    shipping: true,
  },
  {
    name: "Nike Air Zoom Pegasus 39",
    slug: "nike-air-zoom-pegasus-39",
    description:
      "Comfortable and stylish running shoes with responsive cushioning.",
    price: 120.0,
    category: categories[1]._id.toString(),
    quantity: 150,
    photo: {
      data: Buffer.from("dummyimage", "utf-8"),
      contentType: "image/jpeg",
    },
    shipping: true,
  },
  {
    name: "Samsung Galaxy S22",
    slug: "samsung-galaxy-s22",
    description: "Samsung's premium flagship phone with excellent performance.",
    price: 899.99,
    category: categories[0]._id.toString(),
    quantity: 200,
    photo: {
      data: Buffer.from("dummyimage", "utf-8"),
      contentType: "image/png",
    },
    shipping: true,
  },
  {
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description:
      "Premium noise-canceling headphones with superb sound quality.",
    price: 349.99,
    category: categories[0]._id.toString(),
    quantity: 50,
    photo: {
      data: Buffer.from("dummyimage", "utf-8"),
      contentType: "image/jpeg",
    },
    shipping: false,
  },
];
const insertDummyData = async () => {
  // clears mongodb, then inserts the dummy rows from products and categories arrays
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});
  await categoryModel.insertMany(categories);
  await productModel.insertMany(products);
};
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  app = express();
  app.use(express.json());
  app.use(ExpressFormidable());
  app.get("/api/v1/product/get-product", getProductController);
  app.post("/api/v1/product/create-product", createProductController);
});

afterAll(async () => {
  await mongoose.disconnect();
});

// purge the db before and after every test to be safe
beforeEach(async () => {
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});
});

afterEach(async () => {
  await productModel.deleteMany({});
  await categoryModel.deleteMany({});
});

describe("createProductController integration tests", () => {
  it("should successfully create a product without photo", async () => {
    await insertDummyData();
    const newProduct = {
      name: "Product name",
      description: "Product description",
      price: 100,
      category: products[0].category,
      quantity: 10,
    };
    const originalCount = await productModel.countDocuments({});
    const response = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", newProduct.name)
      .field("description", newProduct.description)
      .field("price", newProduct.price)
      .field("category", newProduct.category)
      .field("quantity", newProduct.quantity);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Product Created Successfully");
    const newCount = await productModel.countDocuments({});
    expect(originalCount).toEqual(newCount - 1);
    const addedDocument = await productModel.findOne({ name: newProduct.name });
    expect(addedDocument.name).toBe(newProduct.name);
    expect(addedDocument.description).toBe(newProduct.description);
    expect(addedDocument.price).toBe(newProduct.price);
    expect(addedDocument.category.toString()).toBe(
      newProduct.category.toString()
    );
    expect(addedDocument.quantity).toBe(newProduct.quantity);
  });
  it("should successfully create a product with photo", async () => {
    await insertDummyData();
    const newProduct = {
      name: "Product name",
      description: "Product description",
      price: 100,
      category: products[0].category,
      quantity: 10,
    };
    const response = await request(app)
      .post("/api/v1/product/create-product")
      .field("name", newProduct.name)
      .field("description", newProduct.description)
      .field("price", newProduct.price)
      .field("category", newProduct.category)
      .field("quantity", newProduct.quantity)
      .attach("photo", Buffer.from("fake photo content"), "fake-photo.jpg");
    expect(response.status).toBe(201);
    const addedDocument = await productModel.findOne({ name: newProduct.name });
    expect(addedDocument.photo).toBeDefined();
    expect(addedDocument.photo.data).toBeDefined();
  });
  it("should error when a field is missing", async () => {
    await insertDummyData();
    const newProduct = {
      name: "Product name",
      description: "Product description",
      price: 100,
      category: products[0].category,
      quantity: 10,
    };
    const response = await request(app)
      .post("/api/v1/product/create-product")
      // .field("name", newProduct.name) // remove name from the form
      .field("description", newProduct.description)
      .field("price", newProduct.price)
      .field("category", newProduct.category)
      .field("quantity", newProduct.quantity)
      .attach("photo", Buffer.from("fake photo content"), "fake-photo.jpg");
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Name is Required");
  });
});

describe("getProductController integration tests", () => {
  it("should succeed with no products when mongo is empty", async () => {
    const res = await request(app).get("/api/v1/product/get-product");
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.counTotal).toEqual(0);
  });
  it("should successfully return all products when mongo is not empty", async () => {
    await insertDummyData();
    const res = await request(app).get("/api/v1/product/get-product");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.counTotal).toBe(products.length);
    expect(res.body.message).toBe("All Products");
    let returnedProducts = res.body.products.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    for (let i = 0; i < returnedProducts.length; i++) {
      let product = products[i];
      let savedProduct = returnedProducts[i];
      expect(savedProduct.name).toBe(product.name);
      expect(savedProduct.slug).toBe(product.slug);
      expect(savedProduct.description).toBe(product.description);
      expect(savedProduct.price).toBeCloseTo(product.price, 2);
      expect(savedProduct.quantity).toBe(product.quantity);
      expect(savedProduct.shipping).toBe(product.shipping);
      expect(savedProduct.category._id.toString()).toEqual(
        product.category.toString()
      );
    }
  });
  it("should return error when there is a database issue", async () => {
    await mongoose.disconnect(); // simulate db error
    const res = await request(app).get("/api/v1/product/get-product");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error in getting products");
    await mongoose.connect(process.env.MONGO_URL); //reconnect to the db
  });
});
