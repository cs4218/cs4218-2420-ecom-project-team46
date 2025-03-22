import express from "express";
import JWT from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import supertest from "supertest";
import Category from "../models/categoryModel";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import User from "../models/userModel";
import authRoutes from "../routes/authRoute";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

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

const users = [
  {
    _id: new ObjectId(),
    name: "Joann Osinski",
    email: "Jeanne63@yahoo.com",
    password: "aF55c_8O9kZaPOrysFB_",
    phone: "961-770-7721",
    address: "34830 Erdman Hollow",
    answer: "system",
    role: 0,
  },
  {
    _id: new ObjectId(),
    name: "Cristina Barrows",
    email: "Rosemary_Heidenreich@yahoo.com",
    password: "T4s38dbWVjNVMuN",
    phone: "(368) 215-8636 x36068",
    address: "32965 Elliott Roads",
    answer: "vol",
    role: 0,
  },
];

const admin = {
  _id: new ObjectId(),
  name: "Dr. Jonathon Smitham",
  email: "Kamron92@yahoo.com",
  password: "PIZF1Ke6y_mrvPS",
  phone: "878.554.7323 x5115",
  address: "9864 Bath Road",
  answer: "metabolite",
  role: 1,
};

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
    name: "Frozen Cotton Keyboard",
    slug: "incredible-rubber-soap",
    description:
      "Discover the rich new Mouse with an exciting mix of Granite ingredients",
    price: 795.89,
    quantity: 46,
    category: categories[0]._id,
  },
  {
    _id: new ObjectId(),
    name: "Recycled Metal Salad",
    slug: "fantastic-bamboo-shirt",
    description:
      "Savor the crunchy essence in our Soap, designed for small culinary adventures",
    price: 724.89,
    quantity: 64,
    category: categories[1]._id,
  },
  {
    _id: new ObjectId(),
    name: "Tasty Ceramic Pizza",
    slug: "incredible-cotton-towels",
    description:
      "Ergonomic Pants made with Aluminum for all-day bright support",
    price: 401.39,
    quantity: 4,
    category: categories[2]._id,
  },
];

const orders = [
  {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: true },
    status: "Not Processed",
  },
  {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: true },
    status: "Processing",
  },
  {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: true },
    status: "Shipped",
  },
  {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: false },
    status: "Delivered",
  },
  {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: false },
    status: "Cancelled",
  },
];

beforeAll(async () => {
  try {
    process.env.JWT_SECRET = "jwt-secret";
    await setupDatabase();
    await User.create(admin);
    await Promise.all(
      users.map(async (user) => {
        await User.create(user);
      })
    );
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
    await Promise.all(
      orders.map(async (order) => {
        await Order.create(order);
      })
    );
  } catch (error) {
    console.error("Error setting up test data:", error);
  }
});

afterAll(async () => {
  await teardownDatabase();
});

describe("getOrdersController", () => {
  it("should return a 401 status and an appropriate error message when attempting to fetch orders from '/api/v1/auth/orders' without authentication", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/orders")
      .expect(401);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Authorization token missing"
    );
  });

  it("should return a 200 status and a list of orders for the user's account when attempting to fetch orders from '/api/v1/auth/orders' while authenticated as a user", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/orders")
      .set(
        "Authorization",
        JWT.sign({ _id: users[0]._id }, process.env.JWT_SECRET)
      )
      .expect(200);

    expect(response.body).toHaveLength(orders.length);
    response.body.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < orders.length; i += 1) {
      expect(response.body[i].status).toBe(orders[i].status);
      expect(response.body[i].buyer.name).toBe(users[0].name);
      expect(response.body[i].payment.success).toBe(orders[i].payment.success);
      expect(response.body[i].products).toHaveLength(orders[i].products.length);
      for (let j = 0; j < orders[i].products.length; j += 1) {
        expect(response.body[i].products[j].name).toBe(products[j].name);
        expect(response.body[i].products[j].description).toBe(
          products[j].description
        );
        expect(response.body[i].products[j].price).toBe(products[j].price);
      }
    }
  });

  it("should return a 200 status and an empty list when attempting to fetch orders from '/api/v1/auth/orders' when no past orders exist for a user's account", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/orders")
      .set(
        "Authorization",
        JWT.sign({ _id: users[1]._id }, process.env.JWT_SECRET)
      )
      .expect(200);

    expect(response.body).toHaveLength(0);
    expect(response.body).toEqual([]);
  });

  it("should return a 500 status and an appropriate error message when the database fails", async () => {
    await mongoose.disconnect();
    const response = await supertest(app)
      .get("/api/v1/auth/orders")
      .set(
        "Authorization",
        JWT.sign({ _id: users[0]._id }, process.env.JWT_SECRET)
      )
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Error WHile Getting Orders"
    );

    await mongoose.connect(mongoServer.getUri());
  });
});

describe("getAllOrdersController", () => {
  it("should return a 401 status and an appropriate error message when attempting to fetch orders from '/api/v1/auth/all-orders' without authentication", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/all-orders")
      .expect(401);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Authorization token missing"
    );
  });

  it("should return a 401 status and an appropriate error message when attempting to fetch orders from '/api/v1/auth/all-orders' while authenticated as a user", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/all-orders")
      .set(
        "Authorization",
        JWT.sign({ _id: users[0]._id }, process.env.JWT_SECRET)
      )
      .expect(401);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "UnAuthorized Access");
  });

  it("should return a 200 status and a list of all orders when attempting to fetch orders from '/api/v1/auth/all-orders' while authenticated as a admin", async () => {
    const response = await supertest(app)
      .get("/api/v1/auth/all-orders")
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .expect(200);

    expect(response.body).toHaveLength(orders.length);
    response.body.sort((a, b) => {
      if (a._id < b._id) return -1;
      if (a._id > b._id) return 1;
      return 0;
    });
    for (let i = 0; i < orders.length; i += 1) {
      expect(response.body[i].status).toBe(orders[i].status);
      expect(response.body[i].buyer.name).toBe(users[0].name);
      expect(response.body[i].payment.success).toBe(orders[i].payment.success);
      expect(response.body[i].products).toHaveLength(orders[i].products.length);
      for (let j = 0; j < orders[i].products.length; j += 1) {
        expect(response.body[i].products[j].name).toBe(products[j].name);
        expect(response.body[i].products[j].description).toBe(
          products[j].description
        );
        expect(response.body[i].products[j].price).toBe(products[j].price);
      }
    }
  });

  it("should return a 200 status and an empty list when attempting to fetch orders from '/api/v1/auth/all-orders' when no past orders exist", async () => {
    await Order.deleteMany({});
    const response = await supertest(app)
      .get("/api/v1/auth/all-orders")
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .expect(200);

    expect(response.body).toHaveLength(0);
    expect(response.body).toEqual([]);
  });

  it("should return a 500 status and an appropriate error message when the database fails", async () => {
    await mongoose.disconnect();
    const response = await supertest(app)
      .get("/api/v1/auth/all-orders")
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Error in admin middleware"
    );

    await mongoose.connect(mongoServer.getUri());
  });
});

describe("orderStatusController", () => {
  const order = {
    _id: new ObjectId(),
    products: products.map((product) => product._id),
    buyer: users[0]._id,
    payment: { success: true },
    status: "Not Processed",
  };

  it("should return a 401 status and an appropriate error message when attempting to update order status from 'api/v1/auth/order-status/<order._id>' without authentication", async () => {
    await Order.create(order);
    const status = "Processing";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .send({ status })
      .expect(401);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Authorization token missing"
    );
  });

  it("should return a 401 status and an appropriate error message when attempting to update order status from 'api/v1/auth/order-status/<order._id>' while authenticated as a user", async () => {
    const status = "Processing";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .set(
        "Authorization",
        JWT.sign({ _id: users[0]._id }, process.env.JWT_SECRET)
      )
      .send({ status })
      .expect(401);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "UnAuthorized Access");
  });

  it("should return a 200 status and successfully update order status when attempting to update order status from 'api/v1/auth/order-status/<order._id>' while authenticated as a admin", async () => {
    const status = "Processing";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .send({ status })
      .expect(200);

    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Order status updated successfully"
    );
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe(status);
  });

  it("should return a 400 status and an appropriate error message when attempting to update an invalid order status from 'api/v1/auth/order-status/<order._id>'", async () => {
    const status = "Invalid status";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .send({ status })
      .expect(400);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Invalid status");
  });

  it("should return a 404 status and an appropriate error message when attempting to update a non-existent order from 'api/v1/auth/order-status/<order._id>'", async () => {
    await Order.deleteOne({ _id: order._id });
    const status = "Shipped";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .send({ status })
      .expect(404);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Order not found");
  });

  it("should return a 500 status and an appropriate error message when attempting to update order status from 'api/v1/auth/order-status/<order._id>' when the database fails", async () => {
    await mongoose.disconnect();
    const status = "Shipped";
    const response = await supertest(app)
      .put(`/api/v1/auth/order-status/${order._id}`)
      .set(
        "Authorization",
        JWT.sign({ _id: admin._id }, process.env.JWT_SECRET)
      )
      .send({ status })
      .expect(500);

    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Error in admin middleware"
    );

    await mongoose.connect(mongoServer.getUri());
  });
});
