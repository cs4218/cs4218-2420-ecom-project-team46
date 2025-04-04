import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import dotenv from "dotenv";
import path from "path";

// === CONFIGURATION ===
const NUM_CATEGORIES = 50;
const NUM_USERS = 100_000;
const NUM_PRODUCTS = 100_000;
const NUM_ORDERS = 50_000;
const BATCH_SIZE = 10_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.MONGO_URL;
await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("Connected to MongoDB");

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
  const users = [];
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
  for (let i = 0; i < NUM_PRODUCTS; i++) {
    products.push({
      name: faker.commerce.productName(),
      slug: faker.lorem.slug(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: categories[Math.floor(Math.random() * categories.length)]._id,
      quantity: faker.number.int({ min: 1, max: 100 }),
      shipping: faker.datatype.boolean(),
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
    await clearDatabase();
    const categories = await insertCategories();
    const users = await insertUsers();
    const products = await insertProducts(categories);
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
