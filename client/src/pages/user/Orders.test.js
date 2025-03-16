import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import moment from "moment";
import React from "react";
import { useAuth } from "../../context/auth";
import Orders from "./Orders";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("axios");

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../../components/UserMenu", () => () => <div>User Menu</div>);

const descriptions = [
  "The Robust actuating encryption Salad offers reliable performance and some design",
  "Soft Mouse designed with Ceramic for impish performance",
  "Ergonomic Chair made with Concrete for all-day possible support",
  "Our rich-inspired Sausages brings a taste of luxury to your boiling lifestyle",
];

const truncated_descriptions = [
  "The Robust actuating encryptio",
  "Soft Mouse designed with Ceram",
  "Ergonomic Chair made with Conc",
  "Our rich-inspired Sausages bri",
];

const statuses = [
  "Not Processed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const products = [
  {
    _id: faker.string.uuid(),
    name: "Product 1",
    price: 0,
    description: descriptions[0],
  },
  {
    _id: faker.string.uuid(),
    name: "Product 2",
    price: 49,
    description: descriptions[1],
  },
  {
    _id: faker.string.uuid(),
    name: "Product 3",
    price: 50,
    description: descriptions[2],
  },
  {
    _id: faker.string.uuid(),
    name: "Product 4",
    price: 99,
    description: descriptions[3],
  },
];

const mockedOrders = [
  {
    _id: faker.string.uuid(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    buyer: { name: faker.person.fullName() },
    createdAt: moment().subtract(1, "days").toISOString(),
    payment: { success: true },
    products,
  },
];

describe("User orders page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      { token: faker.internet.jwt().repeat(6) },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: mockedOrders });
  });

  it("should display a header with text matching 'orders'", async () => {
    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText(/orders/i)).toBeInTheDocument();
    });
  });

  it("should not fetch orders from '/api/v1/auth/orders' if unauthenticated", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);
    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith("/api/v1/auth/orders");
    });
  });

  it("should fetch orders from '/api/v1/auth/orders' when authenticated", async () => {
    render(<Orders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders");
    });
  });

  it("should log an error when fetching orders fails", async () => {
    axios.get.mockRejectedValue(new Error());
    const consoleSpy = jest.spyOn(console, "log");
    render(<Orders />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("should not display any orders when no orders are tied to the user account", async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<Orders />);

    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  it("should display order details for successful payment orders", async () => {
    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("#")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Buyer")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Quantity")).toBeInTheDocument();

      expect(screen.getByText(1)).toBeInTheDocument();
      expect(screen.getByText(mockedOrders[0].status)).toBeInTheDocument();
      expect(screen.getByText(mockedOrders[0].buyer.name)).toBeInTheDocument();
      expect(screen.getByText("a day ago")).toBeInTheDocument();
      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText(mockedOrders[0].products.length)
      ).toBeInTheDocument();
    });
  });

  it("should display order details for failed payment orders", async () => {
    const name = faker.person.fullName();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    axios.get.mockResolvedValue({
      data: [
        {
          _id: faker.string.uuid(),
          status,
          buyer: { name },
          createdAt: moment().subtract(1, "days").toISOString(),
          payment: { success: false },
          products,
        },
      ],
    });
    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText("#")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Buyer")).toBeInTheDocument();
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Quantity")).toBeInTheDocument();

      expect(screen.getByText(1)).toBeInTheDocument();
      expect(screen.getByText(status)).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText("a day ago")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(
        screen.getByText(mockedOrders[0].products.length)
      ).toBeInTheDocument();
    });
  });

  it("should display all products associated with an order", async () => {
    render(<Orders />);

    await waitFor(() => {
      products.forEach((product, i) => {
        const image = screen.getByAltText(product.name);
        expect(image).toBeInTheDocument();
        expect(image.src).toMatch(new RegExp(product._id));
        expect(screen.getByText(product.name)).toBeInTheDocument();
        expect(screen.getByText(truncated_descriptions[i])).toBeInTheDocument();
        expect(
          screen.getByText(`Price : ${product.price}`)
        ).toBeInTheDocument();
      });
    });
  });
});
