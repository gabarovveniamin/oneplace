import { useState, useEffect } from 'react';
import { MarketListing } from '../../../core/api/market';

export interface CartItem extends MarketListing {
    quantity: number;
}

// Simple pub/sub for cart updates to keep all hook instances in sync
const listeners = new Set<(cart: CartItem[]) => void>();

const getInitialCart = (): CartItem[] => {
    try {
        const saved = localStorage.getItem('market_cart');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
};

let currentCart: CartItem[] = getInitialCart();

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>(currentCart);

    useEffect(() => {
        const handleUpdate = (newCart: CartItem[]) => setCart(newCart);
        listeners.add(handleUpdate);
        return () => {
            listeners.delete(handleUpdate);
        };
    }, []);

    const updateCart = (newCart: CartItem[]) => {
        currentCart = newCart;
        localStorage.setItem('market_cart', JSON.stringify(newCart));
        listeners.forEach(l => l([...newCart]));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const addToCart = (item: MarketListing) => {
        const existing = currentCart.find(i => i.id === item.id);
        if (existing) {
            updateCart(currentCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            updateCart([...currentCart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId: string) => {
        updateCart(currentCart.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        updateCart(currentCart.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        updateCart([]);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
    };
}
