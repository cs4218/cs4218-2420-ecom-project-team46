import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Category from './categoryModel'

let mongoServer;

describe("Category Model Test", () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("Should create a category successfully", async () => {
    const category = new Category({
      name: "Books",
      slug: "book"
    });
  
    const savedCategory = await category.save();
  
    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe("Books");
    expect(savedCategory.slug).toBe("book");
  });

  test("Should fail if 'name' is missing", async () => {
    const category = new Category({ slug: "book" });
    await expect(category.save()).rejects.toThrow();
  });

  test("Should fail to create category with duplicate name", async () => {  
    const category = new Category({
      name: "Books",
      slug: "book"
    });
  
    await category.save();

    const category_2 = new Category({
      name: "Books",
      slug: "book-duplicate"
    });

    await expect(() => category_2.save()).rejects.toThrow();
  });

  test("Should fail if 'slug' is missing", async () => {
    const category = new Category({ name: "Book" });

    await expect(category.save()).rejects.toThrow();
  });
})