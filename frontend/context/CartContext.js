"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

function getSavedCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedCart = localStorage.getItem("crockery-cart");

    return savedCart ? JSON.parse(savedCart) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    setCartItems(getSavedCart());
    setCartHydrated(true);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;

    localStorage.setItem("crockery-cart", JSON.stringify(cartItems));
  }, [cartHydrated, cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantity,
                  product.stock
                ),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          images: product.images,
          category: product.category,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(quantity, item.stock)
              ),
            }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
