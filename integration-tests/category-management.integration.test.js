import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";

import { 
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController";

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());

  app.post("/api/v1/category/create-category", createCategoryController);
  app.get("/api/v1/category/get-category", categoryControlller);
  app.put("/api/v1/category/update-category/:id", updateCategoryController);
  app.delete("/api/v1/category/delete-category/:id", deleteCategoryController);
  app.get("/api/v1/category/single-category/:slug", singleCategoryController);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await categoryModel.deleteMany({});
});

describe("Category API Integration", () => {

  it("should create a category", async () => {

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Furniture" });

    const matches = await categoryModel.find({name : "Furniture"});

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("New category created");
    expect(res.body.category.name).toBe("Furniture");
    expect(matches.length).toBe(1);
  });

  it("should not create category if no category name specified during creation", async () => {

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "" });

    const matches = await categoryModel.find({name : ""});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Name is required");
    expect(matches.length).toBe(0);
  });

  it("should not recreate a category with same name", async () => {

    await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Furniture" });

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Furniture" });

    const matches = await categoryModel.find({name : "Furniture"});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category already exist");
    expect(matches.length).toBe(1);
  });

  it("should not recreate a category with same name (case insensitive)", async () => {

    await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Books" });

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "BOOKS" });

    const matches = await categoryModel.find({ name: { $regex: new RegExp(`^books$`, "i") } });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category already exist");
    expect(matches.length).toBe(1);
  });

  it("should not recreate a category with same slug", async () => {

    await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Clearance Items" });

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Clearance-Items" });

    const matches = await categoryModel.find({ slug: { $regex: new RegExp(`^${slugify("Clearance Items")}$`, "i") } });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category already exist");
    expect(matches.length).toBe(1);
  });

  it("should not recreate a category with same slug (case insensitive)", async () => {

    await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Clearance Items" });

    const res = await request(app)
      .post("/api/v1/category/create-category")
      .send({ name: "Clearance-items" });

    const matches = await categoryModel.find({ slug: { $regex: new RegExp(`^${slugify("Clearance Items")}$`, "i") } });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category already exist");
    expect(matches.length).toBe(1);
  });

  it("should update an existing category", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });

    const match = await categoryModel.findOne({name : "Furniture"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Beauty" });

    const previous_matches = await categoryModel.find({name : "Furniture"});
    const updated_matches = await categoryModel.find({name : "Beauty"});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category updated successfully");
    expect(updated_matches.length).toBe(1);
    expect(previous_matches.length).toBe(0);

  });

  it("should not update category if updated name is not specified", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });

    const match = await categoryModel.findOne({name : "Furniture"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "" });

    const previous_matches = await categoryModel.find({name : "Furniture"});
    const updated_matches = await categoryModel.find({name : ""});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Name is required");
    expect(updated_matches.length).toBe(0);
    expect(previous_matches.length).toBe(1);
  });

  it("should return error message when a category id does not exist during update", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });

    const match = await categoryModel.findOne({name : "Furniture"});

    await categoryModel.deleteMany({});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Beauty" });

    const updated_matches = await categoryModel.find({name : "Beauty"});

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while updating category");
    expect(updated_matches.length).toBe(0);
  });

  it("should return error message when updated category name clashes with existing category name", async () => {

    await categoryModel.create({ name: "Clothing", slug: slugify("Clothing") });
    await categoryModel.create({ name: "Apparel", slug: slugify("Apparel") });

    const match = await categoryModel.findOne({name : "Clothing"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Apparel" });

    const updated_matches = await categoryModel.find({name : "Apparel"});

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while updating category");
    expect(updated_matches.length).toBe(1);
  });

  it("should return error message when updated category name clashes with existing category name (case insensitive)", async () => {

    await categoryModel.create({ name: "Clothing", slug: slugify("Clothing") });
    await categoryModel.create({ name: "Apparel", slug: slugify("Apparel") });

    const match = await categoryModel.findOne({name : "Clothing"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "apparel" });

    const updated_matches = await categoryModel.find({ name: { $regex: new RegExp(`^apparel$`, "i") } });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while updating category");
    expect(updated_matches.length).toBe(1);
  });

  it("should return error message when updated category slug clashes with another's category slug", async () => {

    await categoryModel.create({ name: "Offer", slug: slugify("Offer") });
    await categoryModel.create({ name: "Clearance Items", slug: slugify("Clearance Items") });

    const match = await categoryModel.findOne({name : "Offer"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Clearance-Items" });
    
    const previous_matches = await categoryModel.find({name : "Offer"});
    const updated_matches = await categoryModel.find({ slug: { $regex: new RegExp(`^${slugify("Clearance Items")}$`, "i") } });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while updating category");
    expect(previous_matches.length).toBe(1);
    expect(updated_matches.length).toBe(1);
  });

  it("should return error message when updated category slug clashes with another's category slug (case insensitive)", async () => {

    await categoryModel.create({ name: "Offer", slug: slugify("Offer") });
    await categoryModel.create({ name: "Clearance Items", slug: slugify("Clearance Items") });

    const match = await categoryModel.findOne({name : "Offer"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Clearance-items" });

    const previous_matches = await categoryModel.find({name : "Offer"});
    const updated_matches = await categoryModel.find({ slug: { $regex: new RegExp(`^${slugify("Clearance Items")}$`, "i") } });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while updating category");
    expect(previous_matches.length).toBe(1);
    expect(updated_matches.length).toBe(1);
  });

  it("should allow change if updated category slug is the same with its previous own slug", async () => {

    await categoryModel.create({ name: "Clearance Items", slug: slugify("Clearance Items") });

    const match = await categoryModel.findOne({name : "Clearance Items"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "clearance-items" });

    const previous_matches = await categoryModel.find({name : "Clearance Items"});
    const updated_matches = await categoryModel.find({name : "clearance-items"});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category updated successfully");
    expect(updated_matches.length).toBe(1);
    expect(previous_matches.length).toBe(0);
  });

  it("should allow change if updated category slug is the same with its previous own slug (case insensitive)", async () => {

    await categoryModel.create({ name: "Clearance Items", slug: slugify("Clearance Items") });

    const match = await categoryModel.findOne({name : "Clearance Items"});

    const res = await request(app)
      .put(`/api/v1/category/update-category/${match._id}`)
      .send({ name: "Clearance-items" });

    const previous_matches = await categoryModel.find({name : "Clearance Items"});
    const updated_matches = await categoryModel.find({name : "Clearance-items"});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category updated successfully");
    expect(updated_matches.length).toBe(1);
    expect(previous_matches.length).toBe(0);
  });

  it("should delete an existing category", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });

    const match = await categoryModel.findOne({name : "Furniture"});

    const res = await request(app)
      .delete(`/api/v1/category/delete-category/${match._id}`);

    const updated_matches = await categoryModel.find({name : "Furniture"});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category deleted successfully");
    expect(match).toBeTruthy();
    expect(updated_matches.length).toBe(0);
  });

  it("should return error message when a category id does not exist during delete", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });

    const match = await categoryModel.findOne({name : "Furniture"});

    await categoryModel.deleteMany({});

    const res = await request(app)
      .delete(`/api/v1/category/delete-category/${match._id}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Error while deleting category");
  });

  it("should fetch all categories when there are existing categories", async () => {

    await categoryModel.create({ name: "Furniture", slug: slugify("Furniture") });
    await categoryModel.create({ name: "Beauty", slug: slugify("Beauty") });
    await categoryModel.create({ name: "Books", slug: slugify("Books") });

    const res = await request(app).get("/api/v1/category/get-category");
    expect(res.statusCode).toBe(200);
    expect(res.body.category.length).toBe(3);
  });

  it("should return no categories when no category present", async () => {

    const res = await request(app).get("/api/v1/category/get-category");
    expect(res.statusCode).toBe(200);
    expect(res.body.category.length).toBe(0);
  });

  it("should get a single category by slug", async () => {

    const categoryName = "Outdoor Camping";
    const expectedSlug = slugify(categoryName);

    await categoryModel.create({ name: categoryName, slug: expectedSlug });

    const res = await request(app)
      .get(`/api/v1/category/single-category/${expectedSlug}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Get single category successfully");
    expect(res.body.category.name).toBe(categoryName);
  });

  it("should return no categories when get a single category by slug does not exist", async () => {

    const categoryName = "Outdoor Camping";
    const expectedSlug = slugify(categoryName);

    await categoryModel.create({ name: categoryName, slug: expectedSlug });
    
    await categoryModel.deleteMany({});

    const res = await request(app)
      .get(`/api/v1/category/single-category/${expectedSlug}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Get single category successfully");
      expect(res.body.category).toBe(null);
  });

});
