import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js"; 

import {
  productCategoryController,
} from "../controllers/productController.js";

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());

  app.get("/api/v1/product/product-category/:slug", productCategoryController);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Category Product API Integration", () => {
  beforeEach(async () => {
    await categoryModel.deleteMany({});
    await productModel.deleteMany({});
  });

  it("should return products for a given category slug", async () => {

    const category = await categoryModel.create({ name: "Electronics", slug: slugify("Electronics") });
    
    await productModel.create( {
        name: "Laptop",
        slug: slugify("Laptop"),
        description: "A powerful laptop for all your computing needs.",
        price: 1500,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
    await productModel.create({
      name: "Smartphone",
      slug: slugify("Smartphone"),
      description: "A feature-rich smartphone with a sleek design.",
      price: 800,
      category: category._id,
      quantity: 20,
      shipping: true,
    });
    await productModel.create({
      name: "Tablet",
      slug: slugify("Tablet"),
      description: "A lightweight tablet for work and play.",
      price: 600,
      category: category._id,
      quantity: 15,
      shipping: false,
    });

    const res = await request(app).get(`/api/v1/product/product-category/${slugify("Electronics")}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category.name).toBe("Electronics");
    expect(res.body.products.length).toBe(3);

    const productNames = res.body.products.map((p) => p.name);
    expect(productNames).toEqual(expect.arrayContaining(["Laptop", "Smartphone", "Tablet"]));
  });

  it("should return only the products in a given category slug even when there are products from other categories in the database", async () => {

    const category = await categoryModel.create({ name: "Electronics", slug: slugify("Electronics") });
    const category2 = await categoryModel.create({ name: "Clearance", slug: slugify("Clearance") });
    
    await productModel.create( {
        name: "Laptop",
        slug: slugify("Laptop"),
        description: "A powerful laptop for all your computing needs.",
        price: 1500,
        category: category._id,
        quantity: 10,
        shipping: true,
      });
    await productModel.create({
      name: "Smartphone",
      slug: slugify("Smartphone"),
      description: "A feature-rich smartphone with a sleek design.",
      price: 800,
      category: category._id,
      quantity: 20,
      shipping: true,
    });
    await productModel.create({
      name: "Tablet",
      slug: slugify("Tablet"),
      description: "A lightweight tablet for work and play.",
      price: 600,
      category: category2._id,
      quantity: 15,
      shipping: false,
    });

    const res = await request(app).get(`/api/v1/product/product-category/${slugify("Electronics")}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category.name).toBe("Electronics");
    expect(res.body.products.length).toBe(2);

    const productNames = res.body.products.map((p) => p.name);
    expect(productNames).toEqual(expect.arrayContaining(["Laptop", "Smartphone"]));
  });

  it("should return an empty array if no products exist for the given category slug", async () => {

    const category = await categoryModel.create({ name: "Books", slug: slugify("Books") });

    const res = await request(app).get(`/api/v1/product/product-category/${slugify("Books")}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.category.name).toBe("Books");
    expect(res.body.products.length).toBe(0);
  });

  it("should return error message if the category slug does not exist", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });
    const match = await categoryModel.findOne({name : "Furniture"});
    await categoryModel.deleteMany({});

    const res = await request(app).get(`/api/v1/product/product-category/${match.slug}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while getting products");
  });
});
