import express from "express";
import { ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import Category from "../models/categoryModel";
import Product from "../models/productModel";
import categoryRoutes from "../routes/categoryRoutes";
import productRoutes from "../routes/productRoutes";

const app = express();
app.use(express.json());
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

let mongoServer;

async function setupDatabase() {
  mongoServer = await MongoMemoryServer.create();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoServer.getUri());
  }
}

async function teardownDatabase() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

const categories = [
  {
    _id: new ObjectId(),
    name: "Tasty Plastic Computer",
    slug: "licensed-metal-shoes",
  },
  {
    _id: new ObjectId(),
    name: "Oriental Gold Computer",
    slug: "fresh-rubber-mouse",
  },
  {
    _id: new ObjectId(),
    name: "Rustic Marble Bacon",
    slug: "unbranded-wooden-pants",
  },
];

const products = [
  {
    _id: new ObjectId(),
    name: "Electronic Marble Chicken",
    slug: "modern-bronze-pants",
    description:
      "Savor the crispy essence in our Keyboard, designed for arid culinary adventures",
    price: 1.0,
    quantity: 30,
    category: categories[0],
  },
  {
    _id: new ObjectId(),
    name: "Fantastic Ceramic Pants",
    slug: "luxurious-silk-chair",
    description:
      "The grey Mouse combines Norfolk Island aesthetics with Darmstadtium-based durability",
    price: 19.0,
    quantity: 12,
    category: categories[0],
  },
  {
    _id: new ObjectId(),
    name: "Handmade Marble Shirt",
    slug: "gorgeous-metal-bike",
    description:
      "Savor the moist essence in our Gloves, designed for parallel culinary adventures",
    price: 20.0,
    quantity: 72,
    category: categories[0],
  },
  {
    _id: new ObjectId(),
    name: "Frozen Cotton Chips",
    slug: "elegant-ceramic-keyboard",
    description:
      "Luxurious Towels designed with Plastic for unwieldy performance",
    price: 39.0,
    quantity: 3,
    category: categories[0],
  },
  {
    _id: new ObjectId(),
    name: "Incredible Plastic Car",
    slug: "fantastic-wooden-bike",
    description:
      "New Towels model with 65 GB RAM, 24 GB storage, and far features",
    price: 40.0,
    quantity: 89,
    category: categories[1],
  },
  {
    _id: new ObjectId(),
    name: "Sleek Cotton Gloves",
    slug: "ergonomic-metal-table",
    description:
      "Hermann, Kirlin and Terry's most advanced Bacon technology increases limited capabilities",
    price: 59.0,
    quantity: 69,
    category: categories[1],
  },
  {
    _id: new ObjectId(),
    name: "Generic Steel Soap",
    slug: "intelligent-ceramic-table",
    description: "New lavender Soap with ergonomic design for familiar comfort",
    price: 99.0,
    quantity: 37,
    category: categories[1],
  },
  {
    _id: new ObjectId(),
    name: "Oriental Steel Pizza",
    slug: "practical-aluminum-pizza",
    description:
      "Steuber - Ebert's most advanced Chips technology increases glum capabilities",
    price: 99.0,
    quantity: 34,
    category: categories[2],
  },
  {
    _id: new ObjectId(),
    name: "Incredible Bronze Ball",
    slug: "rustic-plastic-salad",
    description:
      "Professional-grade Car perfect for strident training and recreational use",
    price: 100.0,
    quantity: 37,
    category: categories[2],
  },
  {
    _id: new ObjectId(),
    name: "Oriental Bronze Gloves",
    slug: "rustic-steel-cheese",
    description:
      "Handcrafted Towels designed with Cotton for crafty performance",
    price: 10000.0,
    quantity: 77,
    category: categories[2],
  },
];

beforeAll(async () => {
  try {
    await setupDatabase();
    await Promise.all(
      categories.map(async (category) => {
        await Category.create(category);
      })
    );
    await Promise.all(
      products.map(async (product) => {
        await Product.create(product);
      })
    );
  } catch (error) {
    console.error("Error setting up test data:", error);
  }
});

afterAll(async () => {
  await teardownDatabase();
});

describe("HomePage", () => {
  it("should return a 200 status code and a list of all categories from /api/v1/category/get-category", async () => {
    const response = await supertest(app)
      .get("/api/v1/category/get-category")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.category).toHaveLength(categories.length);
    expect(response.body.category).toEqual(
      expect.arrayContaining(
        categories.map(({ name, slug }) =>
          expect.objectContaining({ name, slug })
        )
      )
    );
  });

  it("should return a 200 status code and total product count from /api/v1/product/product-count", async () => {
    const response = await supertest(app)
      .get("/api/v1/product/product-count")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(products.length);
  });

  it("should return a 200 status code and a list of all products when fetching the first two pages of a paginated product list", async () => {
    const page_1_response = await supertest(app)
      .get("/api/v1/product/product-list/1")
      .expect(200);
    const page_2_response = await supertest(app)
      .get("/api/v1/product/product-list/2")
      .expect(200);

    expect(page_1_response.body.success).toBe(true);
    expect(page_1_response.body.products).toHaveLength(6);
    expect(page_2_response.body.success).toBe(true);
    expect(page_2_response.body.products).toHaveLength(4);

    const p = [
      ...page_1_response.body.products,
      ...page_2_response.body.products,
    ];
    p.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < products.length; i += 1) {
      expect(p[i].name).toBe(products[i].name);
      expect(p[i].slug).toBe(products[i].slug);
      expect(p[i].description).toBe(products[i].description);
      expect(p[i].price).toBe(products[i].price);
      expect(p[i].quantity).toBe(products[i].quantity);
    }
  });

  it("should return a 200 status code and a list of all products when no filter is applied from '/api/v1/product/product-filters'", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [],
        radio: "",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(products.length);
    response.body.products.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < products.length; i += 1) {
      expect(response.body.products[i].name).toBe(products[i].name);
      expect(response.body.products[i].slug).toBe(products[i].slug);
      expect(response.body.products[i].description).toBe(
        products[i].description
      );
      expect(response.body.products[i].price).toBe(products[i].price);
      expect(response.body.products[i].quantity).toBe(products[i].quantity);
    }
  });

  it("should return a 200 status code and a list of all products in 'Tasty Plastic Computer' category from '/api/v1/product/product-filters'", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [categories[0]._id],
        radio: "",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(4);
    response.body.products.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < 4; i += 1) {
      expect(response.body.products[i].name).toBe(products[i].name);
      expect(response.body.products[i].slug).toBe(products[i].slug);
      expect(response.body.products[i].description).toBe(
        products[i].description
      );
      expect(response.body.products[i].price).toBe(products[i].price);
      expect(response.body.products[i].quantity).toBe(products[i].quantity);
    }
  });

  it("should return a 200 status code and a list of all products greater than or equal to $100 from '/api/v1/product/product-filters'", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: "",
        radio: [100],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(2);
    response.body.products.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < 2; i += 1) {
      expect(response.body.products[i].name).toBe(products[i + 8].name);
      expect(response.body.products[i].slug).toBe(products[i + 8].slug);
      expect(response.body.products[i].description).toBe(
        products[i + 8].description
      );
      expect(response.body.products[i].price).toBe(products[i + 8].price);
      expect(response.body.products[i].quantity).toBe(products[i + 8].quantity);
    }
  });

  it("should return a 200 status code and a list of all products within $80 to $99 in 'Oriental Gold Computer' category from '/api/v1/product/product-filters'", async () => {
    const response = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send({
        checked: [categories[1]._id],
        radio: [80, 99],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe(products[6].name);
    expect(response.body.products[0].slug).toBe(products[6].slug);
    expect(response.body.products[0].description).toBe(products[6].description);
    expect(response.body.products[0].price).toBe(products[6].price);
    expect(response.body.products[0].quantity).toBe(products[6].quantity);
  });
});
