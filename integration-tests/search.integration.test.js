import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import slugify from "slugify";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../models/productModel.js";

import {
    searchProductController,
} from "../controllers/productController.js";

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  app = express();
  app.use(express.json());

  app.get("/api/v1/product/search/:keyword", searchProductController);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Search Product API Integration", () => {
  beforeEach(async () => {
    await productModel.deleteMany({});
  });

    it("should return matching products for a given search keyword (case insensitive)", async () => {
        await productModel.create({
            name: "Laptop",
            slug: slugify("Laptop"),
            description: "High performance laptop",
            price: 1500,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
        });
        await productModel.create({
            name: "personal laptop",
            slug: slugify("personal laptop"),
            description: "For personal use",
            price: 2000,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
        });
        await productModel.create({
            name: "NEW LAPTOP",
            slug: slugify("personal laptop"),
            description: "Offer",
            price: 2000,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
        });
        await productModel.create({
            name: "Desktop",
            slug: slugify("Desktop"),
            description: "Powerful desktop computer",
            price: 2000,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
            shipping: true,
        });
        
        const res = await request(app).get("/api/v1/product/search/laptop");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
        const productNames = res.body.map((p) => p.name);
        expect(productNames).toEqual(
            expect.arrayContaining([expect.stringMatching(/laptop/i)])
            );
    });

    it("should return matching products for a given search keyword (either found in only in name, description or both)", async () => {
        await productModel.create({
            name: "Handheld Device",
            slug: slugify("Handheld Device"),
            description: "An innovative smartphone with advanced features",
            price: 900,
            category: new mongoose.Types.ObjectId(),
            quantity: 12,
            shipping: true,
        });
        await productModel.create({
            name: "Smartphone",
            slug: slugify("Smartphone"),
            description: "A budget-friendly option",
            price: 400,
            category: new mongoose.Types.ObjectId(),
            quantity: 15,
            shipping: true,
        });
        await productModel.create({
            name: "High-end Smartphone",
            slug: slugify("High-end Smartphone"),
            description: "A good smartphone with multiple functionalities",
            price: 400,
            category: new mongoose.Types.ObjectId(),
            quantity: 15,
            shipping: true,
            });
        await productModel.create({
            name: "Tablet",
            slug: slugify("Tablet"),
            description: "A versatile tablet for all your multimedia needs",
            price: 600,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
        });
        
        const res = await request(app).get("/api/v1/product/search/smartphone");
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(3);
        
        res.body.forEach((product) => {
            const nameMatches = product.name.toLowerCase().includes("smartphone");
            const descriptionMatches = product.description.toLowerCase().includes("smartphone");
            expect(nameMatches || descriptionMatches).toBe(true);
        });
    });

    it("should return an empty array if no products match the keyword", async () => {
        await productModel.create({
            name: "Handheld Device",
            slug: slugify("Handheld Device"),
            description: "An innovative smartphone with advanced features",
            price: 900,
            category: new mongoose.Types.ObjectId(),
            quantity: 12,
            shipping: true,
        });
        await productModel.create({
            name: "Smartphone",
            slug: slugify("Smartphone"),
            description: "A budget-friendly option",
            price: 400,
            category: new mongoose.Types.ObjectId(),
            quantity: 15,
            shipping: true,
        });
        await productModel.create({
            name: "High-end Smartphone",
            slug: slugify("High-end Smartphone"),
            description: "A good smartphone with multiple functionalities",
            price: 400,
            category: new mongoose.Types.ObjectId(),
            quantity: 15,
            shipping: true,
            });
        await productModel.create({
            name: "Tablet",
            slug: slugify("Tablet"),
            description: "A versatile tablet for all your multimedia needs",
            price: 600,
            category: new mongoose.Types.ObjectId(),
            quantity: 10,
            shipping: true,
        });
        
        const res = await request(app).get("/api/v1/product/search/nonexistentkeyword");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toEqual([]);
    });
});
