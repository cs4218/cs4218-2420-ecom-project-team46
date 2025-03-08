import React, { useState, useContext, createContext, useEffect } from "react";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // load cart data from localStorage on component mount, and handle JSON parsing errors gracefully, if any. this improves the robustness
  useEffect(() => {
    try {
      const existingCartItem = localStorage.getItem("cart");
      if (existingCartItem) setCart(JSON.parse(existingCartItem));
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

// custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };