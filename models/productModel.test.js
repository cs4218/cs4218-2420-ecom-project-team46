import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Product from "./productModel";

let mongoServer;

describe("productModel Test", () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("Should create product successfully", async () => {
    const product = new Product({
      name: "product123",
      slug: "product123",
      description: "for testing",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    const savedProduct = await product.save();

    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(product.name);
    expect(savedProduct.slug).toBe(product.slug);
    expect(savedProduct.description).toBe(product.description);
    expect(savedProduct.price).toBe(product.price);
    expect(savedProduct.category).toBe(product.category);
    expect(savedProduct.quantity).toBe(product.quantity);
    expect(savedProduct.photo.data).toEqual(product.photo.data);
    expect(savedProduct.photo.contentType).toBe(product.photo.contentType);
    expect(savedProduct.shipping).toBe(product.shipping);
  });

  test("Should fail if 'name' is missing", async () => {
    const product = new Product({
      slug: "product123",
      description: "for testing",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });

  test("Should fail if 'slug' is missing", async () => {
    const product = new Product({
      name: "product123",
      description: "for testing",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });

  test("Should fail if 'description' is missing", async () => {
    const product = new Product({
      name: "product123",
      slug: "product123",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });

  test("Should fail if 'price' is missing", async () => {
    const product = new Product({
      name: "product123",
      description: "for testing",
      slug: "product123",
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });

  test("Should fail if 'category' is missing", async () => {
    const product = new Product({
      name: "product123",
      description: "for testing",
      price: 100,
      slug: "product123",
      quantity: 10,
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });

  test("Should fail if 'quantity' is missing", async () => {
    const product = new Product({
      name: "product123",
      description: "for testing",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      slug: "product123",
      photo: {
        data: Buffer.from(""),
        contentType: "image/png",
      },
      shipping: true,
    });

    await expect(product.save()).rejects.toThrow();
  });
}); 