import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [labId, setLabId] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed.length > 0) {
          setCartItems(parsed);
          setLabId(parsed[0].lab_id);
        }
      } catch (err) {
        console.error('Failed to parse cart items:', err);
      }
    }

    // Listener to keep sync on custom storage events
    const syncCart = () => {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCartItems(parsed);
          setLabId(parsed.length > 0 ? parsed[0].lab_id : null);
        } catch (e) {}
      } else {
        setCartItems([]);
        setLabId(null);
      }
    };
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  const saveCartState = (items) => {
    setCartItems(items);
    if (items.length > 0) {
      setLabId(items[0].lab_id);
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      setLabId(null);
      localStorage.removeItem('cart');
    }
    // Notify other listeners
    window.dispatchEvent(new Event('storage'));
  };

  const addToCart = (item, itemLabId) => {
    // If cart has items from a different lab, prompt/prevent
    if (cartItems.length > 0 && labId !== itemLabId) {
      const confirmClear = window.confirm(
        'Your cart contains tests from another lab. Clear cart and add this item instead?'
      );
      if (!confirmClear) return false;
      
      const newItems = [{ ...item, lab_id: itemLabId }];
      saveCartState(newItems);
      toast.success('Cart cleared and new test added!');
      return true;
    }

    // Check if already in cart
    if (cartItems.some(i => i.id === item.id)) {
      toast.error('This test is already in your cart');
      return false;
    }

    const newItems = [...cartItems, { ...item, lab_id: itemLabId }];
    saveCartState(newItems);
    toast.success('Added to cart!');
    return true;
  };

  const removeFromCart = (itemId) => {
    const updated = cartItems.filter(i => i.id !== itemId);
    saveCartState(updated);
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    saveCartState([]);
  };

  const isInCart = (itemId) => {
    return cartItems.some(i => i.id === itemId);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  };

  const value = {
    cartItems,
    labId,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    getSubtotal,
    itemCount: cartItems.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
