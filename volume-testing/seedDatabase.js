import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";

// === CONFIGURATION ===
const SCALE_FACTOR = 10; // scale up according to how many times from the given dummy data
const NUM_CATEGORIES = 3 * SCALE_FACTOR; // sample data has 3 categories
const NUM_USERS = 12 * SCALE_FACTOR; // sample data has 12 users
const NUM_PRODUCTS = 6 * SCALE_FACTOR; // sample data has 6 products
const NUM_ORDERS = 1 * SCALE_FACTOR; // sample data has 1 order
const BATCH_SIZE = 25_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.MONGO_URL;
await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("Connected to MongoDB");

async function getRandomStockImage() {
  const url = `https://picsum.photos/400/400`; // returns a random image
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return {
    data: Buffer.from(response.data, "binary"),
    contentType: response.headers["content-type"],
  };
}

async function insertCategories() {
  const categories = [];
  for (let i = 0; i < NUM_CATEGORIES; i++) {
    categories.push({
      name: i.toString() + faker.commerce.department(), // add the number to ensure uniqueness
      slug: faker.lorem.slug(),
    });
  }
  const inserted = await Category.insertMany(categories);
  console.log(`Inserted ${inserted.length} categories`);
  return inserted;
}

async function insertUsers() {
  // start with the two default users
  const users = [
    {
      name: "Playwright User Account",
      email: "cs4218@test.com",
      password: "$2b$10$//wWsN./fEX1WiipH57HG.SAwgkYv1MRrPSkpXM38Dy5seOEhCoUy",
      phone: "81234567",
      address: "1 Computing Drive",
      answer: "password is cs4218@test.com",
      role: 0,
    },
    {
      name: "Playwright Admin Account",
      email: "cs4218admin@test.com",
      password: "$2b$10$DbfCqTB.LQtcHgkgLoEdVeGIZi3rsM81j4J5T31rAxjw7WBgCX3Ry",
      phone: "81234567",
      address: "1 Computing Drive",
      answer: "password is cs4218admin@test.com",
      role: 1,
    },
  ];
  for (let i = 0; i < NUM_USERS; i++) {
    users.push({
      name: faker.person.fullName(),
      email: i.toString() + faker.internet.email(), // add the number to ensure uniqueness
      password: faker.internet.password(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        zip: faker.location.zipCode(),
      },
      answer: faker.lorem.sentence(),
      role: faker.number.int({ min: 0, max: 1 }),
    });

    if ((i + 1) % BATCH_SIZE === 0 || i + 1 === NUM_USERS) {
      await User.insertMany(users);
      console.log(`Inserted ${i + 1} users`);
      users.length = 0;
    }
  }
  return await User.find({}, "_id");
}

async function insertProducts(categories) {
  const products = [];
  const photo = await getRandomStockImage();
  for (let i = 0; i < NUM_PRODUCTS; i++) {
    products.push({
      name: faker.commerce.productName(),
      slug: faker.lorem.slug(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: categories[Math.floor(Math.random() * categories.length)]._id,
      quantity: faker.number.int({ min: 1, max: 100 }),
      shipping: faker.datatype.boolean(),
      photo: photo,
    });

    if ((i + 1) % BATCH_SIZE === 0 || i + 1 === NUM_PRODUCTS) {
      await Product.insertMany(products);
      console.log(`Inserted ${i + 1} products`);
      products.length = 0;
    }
  }
  return await Product.find({}, "_id");
}

async function insertOrders(users, products) {
  const orders = [];
  for (let i = 0; i < NUM_ORDERS; i++) {
    const productSample = [
      products[Math.floor(Math.random() * products.length)]._id,
    ];
    orders.push({
      products: productSample,
      payment: {
        amount: parseFloat(faker.commerce.price()),
        method: "Credit Card",
      },
      buyer: users[Math.floor(Math.random() * users.length)]._id,
      status: faker.helpers.arrayElement([
        "Not Processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ]),
    });

    if ((i + 1) % BATCH_SIZE === 0 || i + 1 === NUM_ORDERS) {
      await Order.insertMany(orders);
      console.log(`Inserted ${i + 1} orders`);
      orders.length = 0;
    }
  }
}

async function clearDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Category.deleteMany({}),
  ]);
  console.log("🧹 Cleared all documents from collections");
}

async function seedDatabase() {
  try {
    console.log("Clearing database...");
    await clearDatabase();
    console.log("Inserting categories...");
    const categories = await insertCategories();
    console.log("Inserting users...");
    const users = await insertUsers();
    console.log("Inserting products...");
    const products = await insertProducts(categories);
    console.log("Inserting orders...");
    await insertOrders(users, products);
    console.log("✅ Database seeding complete");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDatabase();
