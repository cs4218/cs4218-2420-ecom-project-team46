// imports for register/login/forgotpassword
import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  getAllUsersController
} from "../controllers/authController.js";
import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
// imports for orders
import { faker } from "@faker-js/faker";
import orderModel from "../models/orderModel.js";
import {
  getAllOrdersController,
  getOrdersController,
  orderStatusController,
} from "./authController";

// mock for register/login/forgotpassword
jest.mock("../models/userModel.js");
jest.mock("../helpers/authHelper.js");
jest.mock("jsonwebtoken");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// mocks for orders
jest.mock("../models/orderModel");

describe("registerController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test each missing required field using test.each
  const requiredFields = ["name", "email", "password", "phone", "address", "answer"];

  test.each(requiredFields)(
    "should return 400 and send appropriate error message when %s is missing",
    async (field) => {
      const reqBody = {
        name: "Test",
        email: "test@example.com",
        password: "123",
        phone: "1234567890",
        address: "Some Address",
        answer: "42",
      };
      delete reqBody[field];
      const req = { body: reqBody };
      const res = mockResponse();

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      // We only check that a message is returned, not its exact content
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    }
  );

  it("should return 409 and send error message when user already exists", async () => {
    const req = {
      body: {
        name: "Test",
        email: "test@example.com",
        password: "123",
        phone: "1234567890",
        address: "Some Address",
        answer: "42",
      },
    };
    const res = mockResponse();
    // Simulate existing user in DB
    userModel.findOne.mockResolvedValue({ email: "test@example.com" });

    await registerController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
      })
    );
  });

  it("should return 201 with user data when registration is successful", async () => {
    const req = {
      body: {
        name: "Test",
        email: "test@example.com",
        password: "123",
        phone: "1234567890",
        address: "Some Address",
        answer: "42",
      },
    };
    const res = mockResponse();
    // Simulate no duplicate user found
    userModel.findOne.mockResolvedValue(null);
    // Simulate password hashing
    hashPassword.mockResolvedValue("hashed123");

    // Mock new userModel instance with a save method
    // Since userModel is used as a constructor, we set its mock implementation to return an object that contains a save method. This save method returns a promise that resolves to the saved user object.
    // Here, we only care about a subset of the user properties (e.g., _id and name) for the test.
    const saveMock = jest.fn().mockResolvedValue({ _id: "user1", name: "Test" });
    userModel.mockImplementation(() => ({ save: saveMock }));

    await registerController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(hashPassword).toHaveBeenCalledWith("123");
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: { _id: "user1", name: "Test" },
      })
    );
  });

  it("should return 500 when an exception is caught", async () => {
    const req = {
      body: {
        name: "Test",
        email: "test@example.com",
        password: "123",
        phone: "1234567890",
        address: "Some Address",
        answer: "42",
      },
    };
    const res = mockResponse();
    // Simulate DB error
    userModel.findOne.mockRejectedValue(new Error("DB Error"));

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
        error: expect.any(Error),
      })
    );
  });

});

describe("loginController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 and send error message when email or password is missing", async () => {
    const req = { body: { email: "", password: "" } };
    const res = mockResponse();

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
      })
    );
  });

  it("should return 401 and send error message when user is not found", async () => {
    const req = { body: { email: "test@example.com", password: "123" } };
    const res = mockResponse();
    userModel.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid email or password", // Exact message as required for security reasons, as it cannot reveal whether email is wrong or password is wrong
      })
    );
  });

  it("should return 401 and send error message when password does not match", async () => {
    const req = { body: { email: "test@example.com", password: "wrongpass" } };
    const res = mockResponse();
    const fakeUser = {
      _id: "user1",
      password: "hashedPassword",
      name: "Test",
      email: "test@example.com",
      phone: "123",
      address: "Some Address",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(fakeUser);
    comparePassword.mockResolvedValue(false);

    await loginController(req, res);

    expect(comparePassword).toHaveBeenCalledWith("wrongpass", fakeUser.password);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid email or password", // Exact message as required for security reasons, as it cannot reveal whether email is wrong or password is wrong
      })
    );
  });

  it("should return 200 with token and user data on successful login", async () => {
    const req = { body: { email: "test@example.com", password: "correctpass" } };
    const res = mockResponse();
    const fakeUser = {
      _id: "user1",
      password: "hashedPassword",
      name: "Test",
      email: "test@example.com",
      phone: "123",
      address: "Some Address",
      role: 0,
    };
    userModel.findOne.mockResolvedValue(fakeUser);
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue("token123");

    await loginController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(comparePassword).toHaveBeenCalledWith("correctpass", fakeUser.password);
    expect(JWT.sign).toHaveBeenCalledWith(
      { _id: fakeUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({
          _id: fakeUser._id,
          name: fakeUser.name,
          email: fakeUser.email,
          phone: fakeUser.phone,
          address: fakeUser.address,
          role: fakeUser.role,
        }),
        token: "token123",
      })
    );
  });

  it("should return 500 with error when an exception is caught", async () => {
    const req = { body: { email: "test@example.com", password: "123" } };
    const res = mockResponse();
    userModel.findOne.mockRejectedValue(new Error("DB error"));

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
        error: expect.any(Error),
      })
    );
  });

});

describe("forgotPasswordController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 and send error message when email is missing", async () => {
    const req = { body: { answer: "42", newPassword: "newpass" } };
    const res = mockResponse();

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("should return 400 and send error message when answer is missing", async () => {
    const req = { body: { email: "test@example.com", newPassword: "newpass" } };
    const res = mockResponse();

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("should return 400 and send error message when newPassword is missing", async () => {
    const req = { body: { email: "test@example.com", answer: "42" } };
    const res = mockResponse();

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it("should return 401 and send error message when wrong email or answer is provided", async () => {
    const req = { body: { email: "test@example.com", answer: "wrong", newPassword: "newpass" } };
    const res = mockResponse();
    userModel.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      answer: "wrong",
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
      })
    );
  });

  it("should return 200 with success message when password reset is successful", async () => {
    const req = {
      body: { email: "test@example.com", answer: "42", newPassword: "newpass" },
    };
    const res = mockResponse();
    const fakeUser = { _id: "user1" };
    userModel.findOne.mockResolvedValue(fakeUser);
    hashPassword.mockResolvedValue("hashedNewPass");
    // Simulate successful password update
    userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

    await forgotPasswordController(req, res);

    expect(userModel.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
      answer: "42",
    });
    expect(hashPassword).toHaveBeenCalledWith("newpass");
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(fakeUser._id, {
      password: "hashedNewPass",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.any(String),
      })
    );
  });

  it("should return 500 with error when an exception is caught", async () => {
    const req = {
      body: { email: "test@example.com", answer: "42", newPassword: "newpass" },
    };
    const res = mockResponse();
    userModel.findOne.mockRejectedValue(new Error("DB Error"));

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
        error: expect.any(Error),
      })
    );
  });

});

describe("testController", () => {
  it('should return "Protected Routes" on normal call', () => {
    const req = {};
    const res = { send: jest.fn() };

    testController(req, res);

    expect(res.send).toHaveBeenCalledWith("Protected Routes");
    // This logic is simple; therefore, only basic assertions are required.
  });
});


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

describe("getAllUsersController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("should return 200 and send all users when fetching is successful", async () => {
    const users = [
      {
        _id: "1", 
        name: "user1",
        email: "user1@testing.com",
        phone: "123423453456",
        address: "bukitpanjang"
      },
      {
        _id: "2", 
        name: "user2",
        email: "user2@testing.com",
        phone: "12342345324e5",
        address: "bukitbatok"
      },
    ];
    userModel.find.mockResolvedValue(users);

    await getAllUsersController(req, res);

    expect(userModel.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      users,
    });
  });

  it("should return 500 and send error message when an exception is caught", async () => {
    const error = new Error("Database Error");
    userModel.find.mockRejectedValue(error);

    const consoleSpy = jest.spyOn(console, "error");

    await getAllUsersController(req, res);

    expect(userModel.find).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in fetching users",
      error: error.message,
    });

    consoleSpy.mockRestore();
  });
});
});
