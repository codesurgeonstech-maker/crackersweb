import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Current active shopId for the active cart session
  const [activeShopId, setActiveShopId] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage when activeShopId changes
  useEffect(() => {
    if (!activeShopId) {
      setCartItems([]);
      return;
    }
    const cartKey = `crackzo_cart_${activeShopId}`;
    const stored = localStorage.getItem(cartKey);
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [activeShopId]);

  // Persist cart to shop-specific storage whenever cartItems change
  const persistItems = useCallback((items, shopId = activeShopId) => {
    setCartItems(items);
    if (shopId) {
      const cartKey = `crackzo_cart_${shopId}`;
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [activeShopId]);

  // Add item or increment quantity
  const addToCart = useCallback((product, quantity = 1, targetShopId = activeShopId) => {
    const shopToUse = targetShopId || product.shopId || activeShopId;
    if (!shopToUse) return;

    if (activeShopId !== shopToUse) {
      setActiveShopId(shopToUse);
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            productId: product.id,
            shopId: shopToUse,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            imageUrl: product.imageUrl || '',
            quantity: quantity
          }
        ];
      }
      const cartKey = `crackzo_cart_${shopToUse}`;
      localStorage.setItem(cartKey, JSON.stringify(updated));
      return updated;
    });
  }, [activeShopId]);

  // Update quantity directly
  const updateQuantity = useCallback((productId, quantity) => {
    if (!activeShopId) return;
    setCartItems(prev => {
      let updated;
      if (quantity <= 0) {
        updated = prev.filter(item => item.id !== productId);
      } else {
        updated = prev.map(item =>
          item.id === productId ? { ...item, quantity: Number(quantity) } : item
        );
      }
      persistItems(updated, activeShopId);
      return updated;
    });
  }, [activeShopId, persistItems]);

  // Remove item
  const removeFromCart = useCallback((productId) => {
    if (!activeShopId) return;
    setCartItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      persistItems(updated, activeShopId);
      return updated;
    });
  }, [activeShopId, persistItems]);

  // Clear entire cart for the active shop
  const clearCart = useCallback((shopIdToClear = activeShopId) => {
    setCartItems([]);
    if (shopIdToClear) {
      localStorage.removeItem(`crackzo_cart_${shopIdToClear}`);
    }
  }, [activeShopId]);

  // Calculations
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        activeShopId,
        setActiveShopId,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
