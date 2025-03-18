import { faker } from "@faker-js/faker";
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import moment from "moment";
import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import AdminOrders from "./AdminOrders";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("axios");

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));

jest.mock("../../components/AdminMenu", () => () => <div>Admin Menu</div>);

jest.mock("antd", () => {
  const MockedSelect = ({
    "data-testid": dataTestId,
    onChange,
    defaultValue,
    children,
  }) => (
    <select
      data-testid={dataTestId}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  MockedSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  return {
    ...jest.requireActual("antd"),
    Select: MockedSelect,
  };
});

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const descriptions = [
  "Experience the lavender brilliance of our Shirt, perfect for slow environments",
  "Featuring Lead-enhanced technology, our Ball offers unparalleled slight performance",
  "The Stand-alone AI-powered function Chair offers reliable performance and instructive design",
  "Featuring Darmstadtium-enhanced technology, our Shirt offers unparalleled useless performance",
];

const truncated_descriptions = [
  "Experience the lavender brilli",
  "Featuring Lead-enhanced techno",
  "The Stand-alone AI-powered fun",
  "Featuring Darmstadtium-enhance",
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
    createdAt: moment().subtract(1, "hour").toISOString(),
    payment: { success: true },
    products,
  },
];

describe("Admin orders page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([
      { token: faker.internet.jwt().repeat(6) },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: mockedOrders });
  });

  it("should display a header with text matching 'orders'", async () => {
    render(<AdminOrders />);

    await waitFor(() => {
      expect(screen.getByText(/orders/i)).toBeInTheDocument();
    });
  });

  it("should not fetch orders from '/api/v1/auth/all-orders' if unauthenticated", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);
    render(<AdminOrders />);

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
  });

  it("should fetch orders from '/api/v1/auth/all-orders' when authenticated", async () => {
    render(<AdminOrders />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
  });

  it("should log an error when fetching orders fails", async () => {
    axios.get.mockRejectedValue(new Error());
    const consoleSpy = jest.spyOn(console, "log");
    render(<AdminOrders />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("should not display any orders when no orders are tied to the user account", async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<AdminOrders />);

    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  it("should display order details for successful payment orders", async () => {
    render(<AdminOrders />);

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
      expect(screen.getByText("an hour ago")).toBeInTheDocument();
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
          createdAt: moment().subtract(1, "hour").toISOString(),
          payment: { success: false },
          products,
        },
      ],
    });
    render(<AdminOrders />);

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
      expect(screen.getByText("an hour ago")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(
        screen.getByText(mockedOrders[0].products.length)
      ).toBeInTheDocument();
    });
  });

  it("should display all available status select options", async () => {
    render(<AdminOrders />);

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(statuses.length);
      statuses.forEach((status, i) => {
        expect(options[i]).toHaveTextContent(status);
      });
    });
  });

  it("should successfully update order status, display toast success message and refetch orders", async () => {
    render(<AdminOrders />);

    await waitFor(() => {
      expect(
        screen.getByTestId(`order-select-${mockedOrders[0]._id}`)
      ).toBeInTheDocument();
    });

    await act(() => {
      userEvent.selectOptions(
        screen.getByTestId(`order-select-${mockedOrders[0]._id}`),
        statuses[3]
      );
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/v1/auth/order-status/${mockedOrders[0]._id}`,
        { status: statuses[3] }
      );
      expect(axios.put).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Order status successfully updated."
      );
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it("should log an error when update order status fails", async () => {
    axios.put.mockRejectedValue(new Error());
    const consoleSpy = jest.spyOn(console, "log");
    render(<AdminOrders />);

    await waitFor(() => {
      const select = screen.getByTestId(`order-select-${mockedOrders[0]._id}`);
      expect(select).toBeInTheDocument();
    });

    act(() => {
      userEvent.selectOptions(
        screen.getByTestId(`order-select-${mockedOrders[0]._id}`),
        statuses[3]
      );
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `/api/v1/auth/order-status/${mockedOrders[0]._id}`,
        { status: statuses[3] }
      );
      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(
        "Order status change failed. Please try again later."
      );
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("should display all products associated with an order", async () => {
    render(<AdminOrders />);

    await waitFor(() => {
      products.forEach((product, i) => {
        const image = screen.getByAltText(product.name);
        expect(image).toBeInTheDocument();
        expect(image.src).toMatch(new RegExp(product._id));
        expect(screen.getByText(product.name)).toBeInTheDocument();
        expect(screen.getByText(truncated_descriptions[i])).toBeInTheDocument();
        expect(
          screen.getByText(`Price : ${product.price.toFixed(2)}`)
        ).toBeInTheDocument();
      });
    });
  });
});
