import { faker } from "@faker-js/faker";
import orderModel from "../models/orderModel.js";
import {
  getAllOrdersController,
  getOrdersController,
  orderStatusController,
} from "./authController";

jest.mock("../models/orderModel");

describe("getOrdersController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: faker.string.uuid() },
    };
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("should successfully fetch and send an empty list when no orders exist for the user account", async () => {
    const orders = [];
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue(orders),
      }),
    });

    await getOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
    expect(orderModel.find().populate).toHaveBeenCalledWith(
      "products",
      "-photo"
    );
    expect(orderModel.find().populate().populate).toHaveBeenCalledWith(
      "buyer",
      "name"
    );
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("should successfully fetch and send all orders for the user account", async () => {
    const orders = [
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-07T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-06T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-05T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
    ];
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue(orders),
      }),
    });

    await getOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({ buyer: req.user._id });
    expect(orderModel.find().populate).toHaveBeenCalledWith(
      "products",
      "-photo"
    );
    expect(orderModel.find().populate().populate).toHaveBeenCalledWith(
      "buyer",
      "name"
    );
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("should log error, return 500 and send error response when fetching orders for the user account errors", async () => {
    const error = new Error();
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      }),
    });
    const consoleSpy = jest.spyOn(console, "log");

    await getOrdersController(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Getting Orders",
      error,
    });

    consoleSpy.mockRestore();
  });
});

describe("getAllOrdersController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("should successfully fetch and send an empty list when no orders exist", async () => {
    const orders = [];
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue(orders),
        }),
      }),
    });

    await getAllOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(orderModel.find().populate).toHaveBeenCalledWith(
      "products",
      "-photo"
    );
    expect(orderModel.find().populate().populate).toHaveBeenCalledWith(
      "buyer",
      "name"
    );
    expect(orderModel.find().populate().populate().sort).toHaveBeenCalledWith({
      createdAt: -1,
    });
    expect(res.json).toHaveBeenCalledWith(orders);
  });

  it("should successfully fetch and send all orders sorted by createdAt", async () => {
    const sortedOrders = [
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-07T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-06T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
      {
        _id: faker.string.uuid(),
        createdAt: "2025-03-05T12:00:00Z",
        buyer: { name: faker.person.fullName() },
        products: [{ name: faker.commerce.productName() }],
      },
    ];
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue(sortedOrders),
        }),
      }),
    });

    await getAllOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(orderModel.find().populate).toHaveBeenCalledWith(
      "products",
      "-photo"
    );
    expect(orderModel.find().populate().populate).toHaveBeenCalledWith(
      "buyer",
      "name"
    );
    expect(orderModel.find().populate().populate().sort).toHaveBeenCalledWith({
      createdAt: -1,
    });
    expect(res.json).toHaveBeenCalledWith(sortedOrders);
  });

  it("should log error, return 500 and send error response when fetching all orders errors", async () => {
    const error = new Error();
    orderModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(error),
        }),
      }),
    });
    const consoleSpy = jest.spyOn(console, "log");

    await getAllOrdersController(req, res);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Getting Orders",
      error,
    });

    consoleSpy.mockRestore();
  });
});

describe("orderStatusController", () => {
  const _id = faker.string.uuid();
  const statuses = [
    "Not Processed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("should successfully update order status and return the updated order details", async () => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const mockedOrderResponse = {
      _id,
      status,
    };
    orderModel.findByIdAndUpdate.mockResolvedValue(mockedOrderResponse);
    req.params.orderId = _id;
    req.body.status = status;

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      _id,
      { status },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(mockedOrderResponse);
  });

  it("should log error, return 500 and send error response when updating order status errors", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    const _id = faker.string.uuid();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const error = new Error();
    orderModel.findByIdAndUpdate.mockRejectedValue(error);
    req.params.orderId = _id;
    req.body.status = status;

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      _id,
      { status },
      { new: true }
    );
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Updating Order",
      error,
    });

    consoleSpy.mockRestore();
  });
});
