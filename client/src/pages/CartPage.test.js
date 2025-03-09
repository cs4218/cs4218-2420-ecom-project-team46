import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CartPage from "./CartPage";
import { MemoryRouter } from "react-router-dom";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import axios from "axios";
import '@testing-library/jest-dom/extend-expect';

jest.mock("../context/cart");
jest.mock("../context/auth");
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("braintree-web-drop-in-react", () => ({
  __esModule: true,
  default: ({ onInstance }) => {
    setTimeout(() => {
      onInstance({
        requestPaymentMethod: jest.fn(() => Promise.resolve({ nonce: "test-nonce" })),
      });
    }, 0);
  },
}));

const user = {
  name: "user123", 
  address: "bukitpanjang"
}

const cart = [
  {
    _id: "1",
    name: "product1",
    description: "for testing 1",
    price: 100,
  },
  {
    _id: "2",
    name: "product2",
    description: "for testing 2",
    price: 200,
  }
]

describe("CartPage test", () => {
  beforeEach(() => {
    useAuth.mockReturnValue([{ token: "test-token", user: user }, jest.fn()]);
    useCart.mockReturnValue([cart, jest.fn()]);
    axios.get.mockResolvedValue({ data: { clientToken: "test-client-token" } });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  test("Renders cart items", async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    
    cart.forEach(async (product) => {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(product.name, "i"))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(product.description, "i"))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(product.price, "i"))).toBeInTheDocument()
      })
    })
  });

  test("Renders total price correctly", async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    
    let totalPrice = 0
    cart.forEach((product) => {
      totalPrice += product.price
    })

    await waitFor(() => expect(screen.getByText(new RegExp(totalPrice))).toBeInTheDocument())
  });

  test("Removes item from cart", () => {
    setCart = jest.fn(() => {});
    useCart.mockReturnValue([cart, setCart]);
    
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getAllByText("Remove")[0]);

    expect(setCart).toHaveBeenCalledWith([{ _id: "2", name: "product2", description: "for testing 2", price: 200 }]);
  });

  test("Removes item from localStorage", () => {
    setCart = jest.fn(() => {});
    useCart.mockReturnValue([cart, setCart]);
    
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    );
    Storage.prototype.setItem = jest.fn();

    fireEvent.click(screen.getAllByText("Remove")[0]);

    expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([{ _id: "2", name: "product2", description: "for testing 2", price: 200 }]));
  });

  test("Calls API with correct data", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByText("Make Payment")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Make Payment"));

    await waitFor(() => { expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
      nonce: "test-nonce",
      cart: cart,
    })}, { timeout: 10000 });
  }, 20000);

  test("Remove cart after successful payment", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });
    Storage.prototype.removeItem = jest.fn(() => {});

    await waitFor(() => expect(screen.getByText("Make Payment")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Make Payment"));

    await waitFor(() => { 
      expect(localStorage.removeItem).toHaveBeenCalledWith("cart")
    }, { timeout: 10000 });
  }, 20000);

  test("Navigate to order page after successful payment", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });
    await waitFor(() => expect(screen.getByText("Make Payment")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Make Payment"));

    await waitFor(() => { 
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders")
  }, { timeout: 10000 });
  }, 20000);

  test("Ask user to login if haven't done so", async () => {
    useAuth.mockReturnValue([{ token: null, user: null }, jest.fn()]);
    useCart.mockReturnValue([cart, jest.fn()]);

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Please Login to checkout")).toBeInTheDocument();
  });

  test("Update address brings to correct page", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByText("Update Address"));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  test("Logs error when handling payment fails", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    axios.post.mockRejectedValue(new Error("Payment failed"));

    await act(async () => {
      render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(screen.getByText("Make Payment")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Make Payment"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    }, { timeout: 10000 });

    consoleSpy.mockRestore();
    
  }, 20000);
});
