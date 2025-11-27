import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        setCart([...cart, item]);
    };

    const setAmount = (id, method) => {
        setCart((prevCart) => {
            if (method === "add") {
                return prevCart.map(item =>
                    item.id === id
                        ? { ...item, amount: item.amount + 1 }
                        : item
                );
            }

            if (method === "minus") {
                return prevCart
                    .map(item =>
                        item.id === id
                            ? { ...item, amount: item.amount - 1 }
                            : item
                    )
                    .filter(item => item.amount > 0);
            }

            return prevCart;
        });
    }

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, setAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);