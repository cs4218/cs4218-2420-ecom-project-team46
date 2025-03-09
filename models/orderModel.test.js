import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import orderModel from './orderModel';

let mongoServer

describe("orderModel test", () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test("Should create an order successfully", async () => {
    const order = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 10 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Processing"
    });

    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.products).toBe(order.products);
    expect(savedOrder.payment).toBe(order.payment);
    expect(savedOrder.buyer).toBe(order.buyer);
    expect(savedOrder.status).toBe(order.status);
  });

  test("Should fail if 'products' is missing", async () => {
    const order = new orderModel({
      payment: { method: "Credit Card", amount: 10 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Processing"
    });

    await expect(order.save()).rejects.toThrow();
  });

  test("Should fail if no product", async () => {
    const order = new orderModel({
      product: [],
      payment: { method: "Credit Card", amount: 10 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Processing"
    });

    await expect(order.save()).rejects.toThrow();
  });

  test("Should fail if buyer field is missing", async () => {
    const order = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 10 },
      status: "Processing"
    });

    await expect(order.save()).rejects.toThrow();
  });

  test("Status default to 'Not Processed'", async () => {
    const order = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 10 },
      buyer: new mongoose.Types.ObjectId(),
    });

    const savedOrder = await order.save();
    expect(savedOrder.status).toBe("Not Processed");
  });

  test("Should enforce enum values for status", async () => {
    const order = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 10 },
      buyer: new mongoose.Types.ObjectId(),
      status: "InvalidStatus",
    });

    await expect(order.save()).rejects.toThrow();
  });
});
